// codeburn-upload — zip CSV exports and send them to a CodeBurn dashboard server.
//
// Usage:
//   go run . [flags]
//
// Flags:
//   -server   Base URL of the dashboard server (default: http://localhost:8080)
//   -dir      Directory containing the exported CSV files (default: current directory)
//   -username Override the username (default: git config user.name)
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
	serverURL := flag.String("server", "http://localhost:8080", "Dashboard server base URL")
	exportDir := flag.String("dir", ".", "Directory containing exported CSV files")
	username := flag.String("username", "", "Username to upload as (default: git config user.name)")
	flag.Parse()

	// Resolve username from git if not specified.
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

	// Build an in-memory ZIP containing all found CSV files.
	var zipBuf bytes.Buffer
	zw := zip.NewWriter(&zipBuf)
	found := 0
	for _, name := range csvFiles {
		path := filepath.Join(*exportDir, name)
		data, err := os.ReadFile(path)
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
		fmt.Fprintf(os.Stderr, "error: no CSV files found in %s\n", *exportDir)
		os.Exit(1)
	}

	fmt.Printf("Zipped %d file(s) (%d bytes)\n", found, zipBuf.Len())

	// Build multipart POST body.
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

	// POST to /upload/{username}
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
