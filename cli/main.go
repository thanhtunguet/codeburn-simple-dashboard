// codeburn-upload — export CodeBurn data and upload it to the dashboard server.
//
// By default the tool runs `npx -y codeburn export <tmpdir>` automatically,
// then zips the resulting CSVs and POSTs them to the server.
//
// Usage:
//
//	codeburn-upload [flags]
//
// Flags:
//
//	-server    Server base URL. Reads CODEBURN_SERVER env first;
//	           falls back to https://codeburn.thanhtunguet.io.vn
//	-username  Username to upload as (default: git config user.name)
//	-dir       Skip auto-export and upload CSVs from this directory instead
package main

import (
	"archive/zip"
	"bytes"
	"flag"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

const defaultServer = "https://codeburn.thanhtunguet.io.vn"

var csvFiles = []string{
	"summary.csv",
	"daily.csv",
	"activity.csv",
	"models.csv",
	"projects.csv",
	"sessions.csv",
	"tools.csv",
	"shell-commands.csv",
}

func main() {
	// Server URL priority: -server flag > CODEBURN_SERVER env > defaultServer
	envServer := os.Getenv("CODEBURN_SERVER")
	if envServer == "" {
		envServer = defaultServer
	}

	serverURL := flag.String("server", envServer, "Dashboard server base URL (env: CODEBURN_SERVER)")
	username := flag.String("username", "", "Username to upload as (default: git config user.name)")
	dir := flag.String("dir", "", "Upload CSVs from this directory instead of running codeburn export")
	flag.Parse()

	// ── Resolve username ──────────────────────────────────────────────────────
	user := strings.TrimSpace(*username)
	if user == "" {
		out, err := exec.Command("git", "config", "user.name").Output()
		if err != nil || strings.TrimSpace(string(out)) == "" {
			fmt.Fprintln(os.Stderr, "error: could not read git user.name; use -username flag")
			os.Exit(1)
		}
		user = strings.TrimSpace(string(out))
	}
	fmt.Printf("Uploading as: %s\n", user)

	// ── Resolve export directory ──────────────────────────────────────────────
	exportDir := strings.TrimSpace(*dir)

	if exportDir == "" {
		// Auto-export: create a temp dir, run `npx -y codeburn export <dir>`.
		tmpDir, err := os.MkdirTemp("", "codeburn-export-*")
		if err != nil {
			fmt.Fprintf(os.Stderr, "error: could not create temp dir: %v\n", err)
			os.Exit(1)
		}
		defer os.RemoveAll(tmpDir) // clean up after upload regardless of outcome

		fmt.Println("Running: npx -y codeburn export", tmpDir)
		cmd := exec.Command("npx", "-y", "codeburn", "export", tmpDir)
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		if err := cmd.Run(); err != nil {
			fmt.Fprintf(os.Stderr, "error: codeburn export failed: %v\n", err)
			os.Exit(1)
		}
		exportDir = tmpDir
	} else {
		fmt.Printf("Using export directory: %s\n", exportDir)
	}

	// ── Build in-memory ZIP from CSV files ────────────────────────────────────
	var zipBuf bytes.Buffer
	zw := zip.NewWriter(&zipBuf)
	found := 0
	for _, name := range csvFiles {
		data, err := os.ReadFile(filepath.Join(exportDir, name))
		if err != nil {
			fmt.Fprintf(os.Stderr, "  skipping %s (not found)\n", name)
			continue
		}
		entry, err := zw.Create(name)
		if err != nil {
			fmt.Fprintf(os.Stderr, "error creating zip entry for %s: %v\n", name, err)
			os.Exit(1)
		}
		if _, err := entry.Write(data); err != nil {
			fmt.Fprintf(os.Stderr, "error writing zip entry for %s: %v\n", name, err)
			os.Exit(1)
		}
		fmt.Printf("  + %s (%d bytes)\n", name, len(data))
		found++
	}
	if err := zw.Close(); err != nil {
		fmt.Fprintf(os.Stderr, "error closing zip: %v\n", err)
		os.Exit(1)
	}
	if found == 0 {
		fmt.Fprintf(os.Stderr, "error: no CSV files found in %s\n", exportDir)
		os.Exit(1)
	}
	fmt.Printf("Zipped %d file(s) (%d bytes)\n", found, zipBuf.Len())

	// ── POST multipart upload ─────────────────────────────────────────────────
	var body bytes.Buffer
	mw := multipart.NewWriter(&body)
	part, err := mw.CreateFormFile("file", "export.zip")
	if err != nil {
		fmt.Fprintf(os.Stderr, "error creating multipart field: %v\n", err)
		os.Exit(1)
	}
	if _, err := io.Copy(part, &zipBuf); err != nil {
		fmt.Fprintf(os.Stderr, "error writing multipart body: %v\n", err)
		os.Exit(1)
	}
	mw.Close()

	uploadURL := strings.TrimRight(*serverURL, "/") + "/upload/" + url.PathEscape(user)
	fmt.Printf("Uploading to %s …\n", uploadURL)

	resp, err := http.Post(uploadURL, mw.FormDataContentType(), &body)
	if err != nil {
		fmt.Fprintf(os.Stderr, "upload failed: %v\n", err)
		os.Exit(1)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		fmt.Fprintf(os.Stderr, "server returned %d: %s\n", resp.StatusCode, strings.TrimSpace(string(respBody)))
		os.Exit(1)
	}
	fmt.Printf("Done. Server response: %s\n", strings.TrimSpace(string(respBody)))
}
