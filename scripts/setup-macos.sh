#!/bin/bash
# macOS Build Instructions for SignalForge

echo "🍎 SignalForge macOS Build Setup"
echo "================================="

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script is for macOS only"
    exit 1
fi

# Check for Xcode Command Line Tools
if ! xcode-select -p &> /dev/null; then
    echo "📦 Installing Xcode Command Line Tools..."
    xcode-select --install
    echo "⏳ Please complete the Xcode installation and run this script again"
    exit 1
fi

# Check for Homebrew
if ! command -v brew &> /dev/null; then
    echo "🍺 Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install dependencies
echo "📦 Installing dependencies..."
brew install cmake git pkg-config

# Optional: Install audio libraries
echo "🎵 Installing audio libraries..."
brew install portaudio jack

echo ""
echo "✅ macOS setup complete!"
echo ""
echo "🚀 To build SignalForge:"
echo "   ./scripts/configure.sh"
echo "   ./scripts/build.sh"
echo ""
echo "🎵 To run SignalForge:"
echo "   ./scripts/run.sh"
echo "   or: open ./build/SignalForge_artefacts/Debug/SignalForge.app"
