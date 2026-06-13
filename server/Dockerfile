# ── Stage 1: build ────────────────────────────────────────────────────────
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Fetch dependencies separately so Docker layer cache survives source-only changes.
COPY go.mod ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build \
    -trimpath \
    -ldflags="-s -w" \
    -o server .

# ── Stage 2: minimal runtime ──────────────────────────────────────────────
FROM alpine:3.20

# ca-certificates is included in case the binary ever makes outbound TLS calls.
RUN apk add --no-cache ca-certificates

WORKDIR /app

COPY --from=builder /app/server .

# CSV data is stored here; mount a volume to persist across container restarts.
RUN mkdir -p data

EXPOSE 8080

ENTRYPOINT ["./server"]
CMD ["-data", "/app/data"]
