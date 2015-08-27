Package.describe({
  name: 'firescar96:hooked-web3-provider',
  summary: 'Web3 provider that adds hooks for an external transaction signer',
  version: "0.0.1",
  documentation: 'README.md',
  git: "https://github.com/Firescar96/hooked-web3-provider"
});

Package.on_use(function (api) {
  api.versionsFrom('METEOR@0.9.3');
  // meteor dependencies
  api.use('ethereum:web3@0.12.2', ['client', 'server']);

  api.add_files('build/hooked-web3-provider.js', ['client', 'server']);

  // symbol exports
  api.export('HookedWeb3Provider',["server", "client"]);
});
