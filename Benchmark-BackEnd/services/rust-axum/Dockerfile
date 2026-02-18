FROM rust:1.85-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache musl-dev

COPY Cargo.toml ./
COPY src ./src

RUN cargo build --release

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/target/release/benchmark-axum .

EXPOSE 3000

CMD ["./benchmark-axum"]
