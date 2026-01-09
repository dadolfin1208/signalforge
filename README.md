# SignalForge

A professional Digital Audio Workstation (DAW) built with JUCE and C++.

## Features

- 🎵 **Multi-track audio** playback and mixing
- 🎛️ **Built-in effects** (EQ, Compressor, Reverb, Chorus, Delay)
- 🎙️ **Audio recording** with real-time monitoring
- 🔌 **Plugin hosting** framework (VST3/AU ready)
- 🎹 **MIDI support** with device management
- 💾 **Project management** (save/load .sfp files)
- 📊 **Waveform display** with visual feedback
- 🖱️ **Drag & drop** audio file loading
- 🎚️ **Professional mixer** with per-track controls

## Quick Start

### 🐧 Linux

#### Dependencies
```bash
sudo apt update && sudo apt install build-essential cmake git pkg-config \
libasound2-dev libjack-jackd2-dev libfreetype6-dev libgtk-3-dev \
libwebkit2gtk-4.1-dev libcurl4-openssl-dev
```

#### Build & Run
```bash
git clone https://github.com/yourusername/signalforge.git
cd signalforge
git submodule update --init --recursive
./scripts/configure.sh
./scripts/build.sh
./scripts/run.sh
```

### 🍎 macOS

#### Setup
```bash
git clone https://github.com/yourusername/signalforge.git
cd signalforge
git submodule update --init --recursive
./scripts/setup-macos.sh  # Installs dependencies
```

#### Build & Run
```bash
./scripts/configure.sh
./scripts/build.sh
./scripts/run.sh
```

**Or launch the app bundle directly:**
```bash
open ./build/SignalForge_artefacts/Debug/SignalForge.app
```

### 🪟 Windows

#### Dependencies
- Visual Studio 2019/2022 with C++ tools
- CMake 3.22+
- Git

#### Build
```cmd
git clone https://github.com/yourusername/signalforge.git
cd signalforge
git submodule update --init --recursive
mkdir build && cd build
cmake .. -G "Visual Studio 17 2022"
cmake --build . --config Debug
```

#### Run
```cmd
.\build\SignalForge_artefacts\Debug\SignalForge.exe
```

## Usage

### Interface Overview
- **Top Toolbar**: Project management, settings, and feature panels
- **Track View**: Multi-track timeline with drag & drop support
- **Waveform Display**: Visual representation of loaded audio
- **Transport Controls**: Play, Stop, Record buttons
- **Mixer Panel**: Channel strips and level controls

### Loading Audio
1. **Drag & Drop**: Drop audio files (.wav, .mp3, .aiff, .flac, .ogg) onto the track view
2. **Load File Button**: Use the "Load File" button in the toolbar
3. **Automatic Tracks**: New tracks are created automatically when needed

### Recording Audio
1. Click the **Record** button in transport controls
2. Audio is saved to `~/Documents/SignalForge/Recordings/`
3. Files are automatically timestamped

### Using Effects
1. Click **Effects** button to open the effects panel
2. Enable EQ, Compressor, Reverb, Chorus, or Delay
3. Adjust parameters with real-time feedback
4. Effects are applied per-track

### Project Management
- **New**: Create a new project
- **Save**: Save current project as .sfp file
- **Load**: Load existing SignalForge project

### MIDI Setup
1. Click **MIDI** button to open MIDI settings
2. Select input/output devices from dropdowns
3. MIDI messages are logged in real-time

## Building from Source

### CMake Options
```bash
cmake .. \
  -DSIGNALFORGE_BUILD_AI_MODULES=ON \
  -DSIGNALFORGE_BUILD_PLUGINS=ON \
  -DSIGNALFORGE_USE_JACK=ON \
  -DSIGNALFORGE_USE_OPENGL=ON
```

### Build Configurations
- **Debug**: Development build with logging
- **Release**: Optimized production build
- **Profile**: Performance profiling build

## Architecture

- **Core/AudioEngine**: Multi-track audio processing
- **Source/GUI**: User interface components
- **ThirdParty/JUCE**: Audio framework
- **Resources**: App bundle resources and assets

## System Requirements

### Minimum
- **OS**: Linux (Ubuntu 20.04+), macOS (10.15+), Windows 10
- **RAM**: 4GB
- **CPU**: Dual-core 2GHz
- **Audio**: ALSA/CoreAudio/WASAPI compatible interface

### Recommended
- **RAM**: 8GB+
- **CPU**: Quad-core 3GHz+
- **Audio**: Professional audio interface with JACK/CoreAudio
- **Storage**: SSD for project files

## License

MIT License - see LICENSE file for details.

## Plugins

SignalForge supports VST3, AU, LV2, and LADSPA plugins. See [PLUGINS.md](PLUGINS.md) for installation guide.

### Quick Plugin Installation
```bash
# Navigate to project directory first
cd signalforge

# Install free plugins automatically
./scripts/install-plugins.sh
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: Wiki pages