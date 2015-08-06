var factory = function(web3) {

  class HookedWeb3Provider extends web3.providers.HttpProvider {
    constructor({host, transaction_signer}) {
      super(host);
      this.transaction_signer = transaction_signer;
    }

    // Note: We *could* make it support synchronous methods, but I don't think we should.
    // Tabling this functionality for now.
    send(payload) {
      throw new Error("HookedWeb3Provider does not support synchronous methods. Please provide a callback.");
    }

    // Catch the requests at the sendAsync level, rewriting all sendTransaction
    // methods to sendRawTransaction, calling out to the transaction_signer to
    // get the data for sendRawTransaction.
    sendAsync(payload, callback) {
      var finishedWithRewrite = () => {
        super.sendAsync(payload, callback);
      };

      var requests = payload;

      if (!(payload instanceof Array)) {
        requests = [payload];
      }

      this.rewritePayloads(0, requests, {}, finishedWithRewrite);
    }

    // Rewrite all eth_sendTransaction payloads in the requests array.
    // This takes care of batch requests, and updates the nonces accordingly.
    rewritePayloads(index, requests, nonces, finished) {
      if (index >= requests.length) {
        finished();
        return;
      }

      var payload = requests[index];

      // Function to remove code duplication for going to the next payload
      var next = (err) => {
        if (err != null) {
          finished(err);
          return;
        }
        this.rewritePayloads(index + 1, requests, nonces, finished);
      };

      // If this isn't a transaction we can modify, ignore it.
      if (payload.method != "eth_sendTransaction") {
        next();
        return;
      }

      var tx_params = payload.params[0];
      var sender = tx_params.from;

      if (!this.transaction_signer.hasAddress(sender)) {
        next();
        return;
      }

      // Get the nonce, requesting from web3 if we need to.
      // Note that we record the nonce for each address in the nonces
      // object once we've gotten the nonce already.
      var getNonceAsHex = function(done) {
        // If a nonce is specified in our nonce list, use that nonce.
        var nonce = nonces[sender];
        if (nonce != null) {
          done(null, web3.toHex(nonce));
          return;
        }
        // Include pending transactions, so the nonce is set accordingly.
        // TODO: Should we call our own sendAsync method here instead of web3?
        // Not calling our own sendAsync leaves room for the possibility we call
        // a different web3 provider in the event we're not the main one registered.
        web3.eth.getTransactionCount(sender, "pending", function(err, new_nonce) {
          if (err != null) {
            done(err);
          } else {
            done(null, web3.toHex(new_nonce));
          }
        });
      };

      // Get the nonce, requesting from web3 if we need to.
      // We then store the nonce and update it so we don't have to
      // to request from web3 again.
      getNonceAsHex((err, nonce) => {
        if (err != null) {
          finished(err);
          return;
        }

        // Set the expected nonce, and update our list of nonces.
        // Remember that nonce is a
        tx_params.nonce = nonce;
        nonces[sender] = web3.toDecimal(nonce) + 1;

        // If our transaction signer does represent the address,
        // sign the transaction ourself and rewrite the payload.
        this.transaction_signer.signTransaction(tx_params, function(err, raw_tx) {
          if (err != null) {
            next(err);
            return;
          }

          payload.method = "eth_sendRawTransaction";
          payload.params = [raw_tx];
          next();
        });
      });
    }
  }

  return HookedWeb3Provider;
};

var module = module || undefined;
if (module != null) {
  module.exports = factory(require("web3"));
} else {
  window.HookedWeb3Provider = factory(web3);
}
