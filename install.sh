#!/bin/sh

set -e

# Config
REPO="MandemGibson/lit"
INSTALL_DIR="$HOME/.lit/bin"
BINARY_NAME="lit"

# Color helpers
info() { echo "\033[34m[info]\033[0m $*"; }
success() { echo "\033[32m[success]\033[0m $*"; }
error() { echo "\033[31m[error]\033[0m $*" >&2; exit 1; }

# Detect OS
OS="$(uname -s)"
case "$OS" in
  Darwin)  OS_NAME="darwin" ;;
  Linux)   OS_NAME="linux" ;;
  *)       error "Unsupported operating system: $OS" ;;
esac

# Detect Architecture
ARCH="$(uname -m)"
case "$ARCH" in
  x86_64)  ARCH_NAME="amd64" ;;
  arm64|aarch64) ARCH_NAME="arm64" ;;
  *)       error "Unsupported architecture: $ARCH" ;;
esac

# Formulate asset filename
ASSET_FILE="lit-${OS_NAME}-${ARCH_NAME}.tar.gz"
DOWNLOAD_URL="https://github.com/${REPO}/releases/latest/download/${ASSET_FILE}"

info "Detected system: ${OS} (${ARCH})"
info "Downloading latest CLI from: ${DOWNLOAD_URL}"

# Create install directory
mkdir -p "$INSTALL_DIR"

# Create temp directory
TEMP_DIR="$(mktemp -d)"
cleanup() { rm -rf "$TEMP_DIR"; }
trap cleanup EXIT

TEMP_TAR="${TEMP_DIR}/${ASSET_FILE}"

if ! curl -fsSL "$DOWNLOAD_URL" -o "$TEMP_TAR"; then
  error "Failed to download $ASSET_FILE from GitHub. Please make sure a release exists."
fi

# Extract
info "Extracting CLI..."
tar -xzf "$TEMP_TAR" -C "$TEMP_DIR"

# Find extracted binary (it could be named lit-darwin-amd64 depending on release step)
# We rename it to just "lit"
EXTRACTED_FILE=""
for file in "$TEMP_DIR"/*; do
  if [ -f "$file" ] && [ "$(basename "$file")" != "$ASSET_FILE" ]; then
    EXTRACTED_FILE="$file"
    break
  fi
done

if [ -z "$EXTRACTED_FILE" ]; then
  error "Extracted binary not found in release archive."
fi

mv "$EXTRACTED_FILE" "$INSTALL_DIR/$BINARY_NAME"
chmod +x "$INSTALL_DIR/$BINARY_NAME"

success "Successfully installed Lit CLI to $INSTALL_DIR/$BINARY_NAME"

# Check if PATH contains install directory
SHELL_CONFIG=""
case "$SHELL" in
  */zsh)  SHELL_CONFIG="$HOME/.zshrc" ;;
  */bash) SHELL_CONFIG="$HOME/.bashrc" ;;
  *)      SHELL_CONFIG="$HOME/.profile" ;;
esac

PATH_LINE="export PATH=\"\$HOME/.lit/bin:\$PATH\""

if echo "$PATH" | grep -q "$INSTALL_DIR"; then
  success "Lit CLI is already in your PATH."
else
  info "Adding Lit CLI to your PATH in $SHELL_CONFIG..."
  
  # Append to shell config if not already there
  if [ -f "$SHELL_CONFIG" ]; then
    if ! grep -q ".lit/bin" "$SHELL_CONFIG"; then
      printf "\n# Lit CLI\n%s\n" "$PATH_LINE" >> "$SHELL_CONFIG"
      success "Added to $SHELL_CONFIG."
    else
      info "PATH configuration already exists in $SHELL_CONFIG."
    fi
  else
    printf "# Lit CLI\n%s\n" "$PATH_LINE" > "$SHELL_CONFIG"
    success "Created $SHELL_CONFIG and added to PATH."
  fi
  
  echo ""
  echo "\033[33m👉 To start using the CLI immediately, run:\033[0m"
  echo "   source $SHELL_CONFIG"
fi
