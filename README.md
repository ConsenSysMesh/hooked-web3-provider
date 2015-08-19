# Hooked Web3 Provider

The Hooked Web3 Provider is a normal HTTP Web3 provider that allows you to "hook in" an external transaction signer that can be used to sign transactions for accounts not managed by the Ethereum client (i.e., aren't managed by `geth`). An example transaction signer might be an external program or device that manages its own accounts and private keys. Together, the transaction signer and the web3 provider will use the Ethereum client to place signed transactions on the network.

The goal of this library is to successfully modularize all the moving parts related to external transaction signing, to improve usability and encourage a separation of concerns.

### Install

```
npm install hooked-web3-provider
``` 

### Use

First, include the package. In Node:

```
var HookedWeb3Provider = require("hooked-web3-provider");
```

Or the Browser:

```
<script type="text/javascript" src="./build/hooked-web3-provider.js"></script>
```

Then, instantiate the provider:

```
var provider = new HookedWeb3Provider({
  host: "http://localhost:8545",
  transaction_signer: { 
    // Can be any object that implements the following methods:
    hasAddress: function(address, callback) {...},
    signTransaction: function(tx_params, callback) {...}
  }
});
```

### Transaction Signer Interface

Transaction signers are bound by a simple interface. The object must contain two methods, described below.

##### hasAddress(address, callback)

Asynchronous method used to determine if the transaction signer manages the address passed in. We recommend the transaction signer account for addresses that start with "0x" as well as those that do not. 

######Arguments:

* `string` - Address that will be checked. 
* `function(error, boolean)` - callback when finished. If an error occured, `error` will be non-null; otherwise it's null. Upon a successful request, the boolean value will represent whether or not the address is managed by the transaction signer.

##### signTransaction(tx_params, callback)

Asynchronous method used to sign a transaction. This method will only be called if `hasAddress` provides a value of `true` for a specific address. This method should sign a transaction based on the parameters. 

######Arguments

* `object` - An object containing the transaction parameters. Example below.
* `function(error, string)` - callback when finished signing. If an error occured, `error` will be non-null; otherwise it's null. If the transaction was successfully signed, the string reterned via the callback will be the raw, signed hash of the transaction. Example below.

**Example Transaction Parameters: tx_params**

Note that proper transaction parameters are those used by web3 in its RPC interface. All values are hexadecimal, and are prefixed with "0x".

```
{
  from: "0x985095ef977ba75fb2bb79cd5c4b84c81392dff6",
  gas: "0x2fefd8",
  gasPrice: "0xba43b7400",
  nonce: "0x21",
  to: "0x54450450e24286143a35686ad77a7c851ada01a0",
  value: "0xde0b6b3a7640000",
  data: "0x..."
}
```

**Example Raw Transaction Response**

The above example transaction parameters, when signed, would produce a raw, signed transaction like the following:

```
0xf86d21850ba43b7400832fefd89454450450e24286143a35686ad77a7c851ada01a0880de0b6b3a7640000801ba0c36fdbf8043a64a6096ee81da4de7f04def477b9a3210a18967fad07f72112b2a04aedfd1d9d9085256373b40ef02bc3da0a95054f40075de340086c9512707b29
```

### Example Use

For an example of this in action, see `./build/index.html` for a test application that uses the hooked provider in conjunction with ethereumjs-accounts.

### Develop / Contribute

To develop and contribute to this project, first install Truffle:

```
$ npm install -g truffle
```

Then edit `./app/hooked-web3-provider.es6`, and run:

```
cd ./checkout/of/repository
$ truffle build
```

You can have Truffle build automatically as you make changes via:

```
$ truffle watch
```

### License

MIT
