{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, utils, ... }:
    utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in
      {
        devShells.default = pkgs.mkShell {
          nativeBuildInputs = with pkgs; [ pkg-config ];
          buildInputs = with pkgs; [ udev ]; # for @solana/wallet-adapter-wallets
          packages = with pkgs; [
            nodejs-slim
            nodePackages.pnpm
          ];
          shellHook = ''
            set -a; source .env; set +a
          '';
        };
      });
}
