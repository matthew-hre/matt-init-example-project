{
  mkShell,
  alejandra,
  bash,
  nodejs,
  pnpm,
  turso-cli,
  sqld,
}:
mkShell rec {
  name = "matt-init-example-project";

  packages = [
    bash
    nodejs
    pnpm

    # Required for CI for format checking.
    alejandra

    turso-cli
    sqld
  ];
}
