package main

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
)

const maxUploadSize = 50 << 20 // 50 MB

// allowedFiles is the fixed set of CSVs the dashboard expects.
var allowedFiles = map[string]bool{
	"summary.csv":        true,
	"daily.csv":          true,
	"activity.csv":       true,
	"models.csv":         true,
	"projects.csv":       true,
	"sessions.csv":       true,
	"tools.csv":          true,
	"shell-commands.csv": true,
}

func main() {
	dataDir := flag.String("data", "./data", "Directory to store per-user CSV data")
	staticDir := flag.String("static", "./dist", "Directory with built frontend assets")
	port := flag.String("port", "8080", "Port to listen on")
	flag.Parse()

	if err := os.MkdirAll(*dataDir, 0755); err != nil {
		fmt.Fprintf(os.Stderr, "failed to create data dir: %v\n", err)
		os.Exit(1)
	}

	mux := http.NewServeMux()

	// POST /upload/{username}
	// Accepts a multipart form with a "file" field containing a ZIP archive of CSV files.
	mux.HandleFunc("POST /upload/{username}", func(w http.ResponseWriter, r *http.Request) {
		username := r.PathValue("username")

		r.Body = http.MaxBytesReader(w, r.Body, maxUploadSize)
		if err := r.ParseMultipartForm(maxUploadSize); err != nil {
			http.Error(w, "request too large or invalid multipart", http.StatusBadRequest)
			return
		}

		file, _, err := r.FormFile("file")
		if err != nil {
			http.Error(w, "missing 'file' field in form", http.StatusBadRequest)
			return
		}
		defer file.Close()

		buf, err := io.ReadAll(file)
		if err != nil {
			http.Error(w, "failed to read uploaded file", http.StatusInternalServerError)
			return
		}

		zr, err := zip.NewReader(bytes.NewReader(buf), int64(len(buf)))
		if err != nil {
			http.Error(w, "uploaded file is not a valid ZIP archive", http.StatusBadRequest)
			return
		}

		userDir := filepath.Join(*dataDir, username)
		if err := os.MkdirAll(userDir, 0755); err != nil {
			http.Error(w, "failed to create user directory", http.StatusInternalServerError)
			return
		}

		extracted := 0
		for _, f := range zr.File {
			// Strip any directory prefix inside the ZIP (e.g. "export/summary.csv" → "summary.csv")
			name := filepath.Base(f.Name)
			if !allowedFiles[name] {
				continue
			}
			rc, err := f.Open()
			if err != nil {
				continue
			}
			dst, err := os.Create(filepath.Join(userDir, name))
			if err != nil {
				rc.Close()
				continue
			}
			_, copyErr := io.Copy(dst, rc)
			dst.Close()
			rc.Close()
			if copyErr == nil {
				extracted++
			}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"username":  username,
			"extracted": extracted,
		})
	})

	// GET /users
	// Returns a JSON array of usernames that have uploaded data.
	mux.HandleFunc("GET /users", func(w http.ResponseWriter, r *http.Request) {
		entries, err := os.ReadDir(*dataDir)
		if err != nil {
			http.Error(w, "failed to list users", http.StatusInternalServerError)
			return
		}
		users := []string{}
		for _, e := range entries {
			if e.IsDir() {
				users = append(users, e.Name())
			}
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(users)
	})

	// GET /data/{username}/{file}
	// Serves a single CSV file for the given user.
	mux.HandleFunc("GET /data/{username}/{file}", func(w http.ResponseWriter, r *http.Request) {
		username := r.PathValue("username")
		filename := r.PathValue("file")
		if !allowedFiles[filename] {
			http.Error(w, "file not found", http.StatusNotFound)
			return
		}
		http.ServeFile(w, r, filepath.Join(*dataDir, username, filename))
	})

	// GET / — serve the built frontend (SPA: fall back to index.html for unknown paths)
	mux.Handle("/", spaHandler(*staticDir))

	addr := ":" + *port
	fmt.Printf("CodeBurn dashboard server → http://localhost%s\n", addr)
	if err := http.ListenAndServe(addr, withCORS(mux)); err != nil {
		fmt.Fprintf(os.Stderr, "server error: %v\n", err)
		os.Exit(1)
	}
}

// spaHandler serves static files; falls back to index.html for missing paths
// so that client-side routing works correctly.
func spaHandler(staticDir string) http.Handler {
	fs := http.FileServer(http.Dir(staticDir))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := filepath.Join(staticDir, filepath.Clean("/"+r.URL.Path))
		if _, err := os.Stat(path); os.IsNotExist(err) {
			// Serve index.html for any path that doesn't map to a real file
			http.ServeFile(w, r, filepath.Join(staticDir, "index.html"))
			return
		}
		fs.ServeHTTP(w, r)
	})
}

// withCORS wraps a handler with permissive CORS headers (no auth required).
func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
