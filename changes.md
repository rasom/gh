# Breaking Changes

## Global Flags

- Change `--verbose` to `--info`
- Change `--insane` to `--debug`

## Calling Subcommands

- Change `gh issue --list --all` to `gh issue:list --all`
  - Brings clearer separation of 2nd subcommand like (`--list`) from its subcommands like (`--all`)

## .gh.json File

- Remove color from output by adding "color": false in .gh.json

# Non Breaking Changes
