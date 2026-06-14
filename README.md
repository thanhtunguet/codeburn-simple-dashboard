# codeburn-upload

Bash script that exports CodeBurn usage data and uploads it to the CodeBurn dashboard server.

It runs `npx -y codeburn export`, zips the CSV files, and POSTs the archive to `{server}/upload/{username}`.

## Prerequisites

- **Node.js** — required for `npx` to run the `codeburn` CLI
- **git** — used to read `user.name` as the default upload username
- **curl** — uploads the ZIP to the server
- **zip** — bundles CSV files before upload
- **python3** — URL-encodes the username in the upload path

Check that `npx` is available:

```bash
node --version
npx --version
```

Install Node.js from [nodejs.org](https://nodejs.org/) or your system package manager if needed.

## Installation

Download the script with `curl` or `wget`:

```bash
# curl
curl -fsSL -o codeburn-upload.sh \
  https://raw.githubusercontent.com/thanhtunguet/codeburn-simple-dashboard/main/scripts/codeburn-upload.sh

# wget
wget -O codeburn-upload.sh \
  https://raw.githubusercontent.com/thanhtunguet/codeburn-simple-dashboard/main/scripts/codeburn-upload.sh
```

Make it executable:

```bash
chmod +x codeburn-upload.sh
```

Optional — install into a directory on your `PATH`:

```bash
mv codeburn-upload.sh ~/bin/codeburn-upload
# or
sudo mv codeburn-upload.sh /usr/local/bin/codeburn-upload
```

## Usage

Export and upload in one step:

```bash
./codeburn-upload.sh
```

The script will:

1. Run `npx -y codeburn export`
2. Zip the exported CSV files
3. Upload to the dashboard server
4. Ask whether to delete the temporary export directory

### Options

| Option | Description |
|--------|-------------|
| `-s`, `--server URL` | Dashboard server base URL (default: `https://codeburn.thanhtunguet.io.vn`) |
| `-u`, `--username NAME` | Username to upload as (default: `git config user.name`) |
| `-d`, `--dir PATH` | Skip export; upload CSVs from an existing directory |
| `-h`, `--help` | Show help |

### Examples

```bash
# Upload using defaults (server + git username)
./codeburn-upload.sh

# Custom server via flag
./codeburn-upload.sh --server https://codeburn.example.com

# Custom server via environment variable
CODEBURN_SERVER=https://codeburn.example.com ./codeburn-upload.sh

# Explicit username
./codeburn-upload.sh --username "Jane Doe"

# Upload a previously exported directory (skip codeburn export)
./codeburn-upload.sh --dir ~/Downloads/codeburn-export-2026-06-13
```

### Expected CSV files

The script looks for these files in the export directory:

- `summary.csv`
- `daily.csv`
- `activity.csv`
- `models.csv`
- `projects.csv`
- `sessions.csv`
- `tools.csv`
- `shell-commands.csv`

Missing files are skipped; at least one CSV must be present.
