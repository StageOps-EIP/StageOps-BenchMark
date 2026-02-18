FROM rust:1.85-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache musl-dev

COPY Cargo.toml ./
COPY src ./src

# Force specific time version compatible with Rust 1.85
RUN cargo update -p time --precise 0.3.36 && \
    cargo build --release

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/target/release/benchmark-actix .

EXPOSE 3000

CMD ["./benchmark-actix"]
