#!/bin/bash

# SignalForge Plugin Installation Script
# Installs free, open-source audio plugins compatible with SignalForge

set -e

echo "🎵 SignalForge Plugin Installer"
echo "================================"

# Check if running on supported system
if ! command -v apt &> /dev/null; then
    echo "❌ This script requires apt package manager (Ubuntu/Debian)"
    echo "Please install plugins manually on your system"
    exit 1
fi

echo "📦 Updating package lists..."
sudo apt update

echo "🎛️ Installing Calf Studio Gear plugins..."
sudo apt install -y calf-plugins

echo "🎹 Installing Surge Synthesizer..."
if ! sudo apt install -y surge-synthesizer 2>/dev/null; then
    echo "⚠️  Surge not available in default repos, trying snap..."
    if command -v snap &> /dev/null; then
        sudo snap install surge-synthesizer
    else
        echo "⚠️  Surge installation failed - install manually from surge-synthesizer.github.io"
    fi
fi

echo "🔊 Installing additional audio tools..."
sudo apt install -y \
    ladspa-sdk \
    swh-plugins \
    tap-plugins \
    rev-plugins \
    mcp-plugins \
    cmt \
    fil-plugins \
    omins \
    blop

echo "📁 Creating plugin directories..."
mkdir -p ~/.vst3
mkdir -p ~/.lv2
mkdir -p ~/.ladspa

echo "🔍 Checking installed plugins..."
echo ""
echo "VST3 plugins:"
find /usr/lib/vst3 ~/.vst3 -name "*.vst3" 2>/dev/null | head -10 || echo "None found"

echo ""
echo "LV2 plugins:"
find /usr/lib/lv2 ~/.lv2 -name "*.lv2" 2>/dev/null | wc -l | xargs echo "Found" | sed 's/$/ LV2 plugin bundles/'

echo ""
echo "LADSPA plugins:"
find /usr/lib/ladspa ~/.ladspa -name "*.so" 2>/dev/null | wc -l | xargs echo "Found" | sed 's/$/ LADSPA plugins/'

echo ""
echo "✅ Plugin installation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Restart SignalForge"
echo "2. Click 'Plugins' button in the interface"
echo "3. Browse and load plugins onto your tracks"
echo ""
echo "💡 For more plugins, see PLUGINS.md in the project root"
