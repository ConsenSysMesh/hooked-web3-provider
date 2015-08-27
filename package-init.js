/* jshint ignore:start */

// Meteor
if (typeof Package !== 'undefined') {
  /*global async:true*/  // Meteor.js creates a file-scope global for exporting. This comment prevents a potential JSHint warning.
  HookedWeb3Provider = this.HookedWeb3Provider;
  delete this.HookedWeb3Provider;
}

// Browser environment
if(typeof window !== 'undefined') {
    HookedWeb3Provider = (typeof window.HookedWeb3Provider !== 'undefined') ? window.HookedWeb3Provider : require('hooked-web3-provider');
}

// Node environment
if(typeof global !== 'undefined') {
    HookedWeb3Provider = (typeof global.HookedWeb3Provider !== 'undefined') ? global.HookedWeb3Provider : require('hooked-web3-provider');
}

/* jshint ignore:end */
