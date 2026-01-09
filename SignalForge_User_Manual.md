# SignalForge DAW
## Complete User Manual & Installation Guide

**Version 0.1.0**  
**Professional Digital Audio Workstation**

---

## Table of Contents

1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Installation Guide](#installation-guide)
   - [Linux Installation](#linux-installation)
   - [macOS Installation](#macos-installation)
   - [Windows Installation](#windows-installation)
4. [Getting Started](#getting-started)
5. [Interface Guide](#interface-guide)
6. [Audio Recording](#audio-recording)
7. [Multi-track Editing](#multi-track-editing)
8. [Effects & Processing](#effects--processing)
9. [MIDI Support](#midi-support)
10. [Project Management](#project-management)
11. [Troubleshooting](#troubleshooting)
12. [Advanced Features](#advanced-features)

---

## Overview

SignalForge is a professional Digital Audio Workstation (DAW) built with JUCE and C++, designed for music production, audio editing, and sound design. It provides a complete solution for recording, editing, mixing, and mastering audio projects.

### Key Features

- 🎵 **Multi-track audio** playback and mixing
- 🎛️ **Built-in effects** (EQ, Compressor, Reverb, Chorus, Delay)
- 🎙️ **Audio recording** with real-time monitoring
- 🔌 **Plugin hosting** framework (VST3/AU ready)
- 🎹 **MIDI support** with device management
- 💾 **Project management** (save/load .sfp files)
- 📊 **Waveform display** with visual feedback
- 🖱️ **Drag & drop** audio file loading
- 🎚️ **Professional mixer** with per-track controls

---

## System Requirements

### Minimum Requirements

| Component | Linux | macOS | Windows |
|-----------|-------|-------|---------|
| **Operating System** | Ubuntu 20.04+ | macOS 10.15+ | Windows 10 |
| **RAM** | 4GB | 4GB | 4GB |
| **CPU** | Dual-core 2GHz | Dual-core 2GHz | Dual-core 2GHz |
| **Storage** | 2GB free space | 2GB free space | 2GB free space |
| **Audio** | ALSA compatible | CoreAudio | WASAPI |

### Recommended Requirements

| Component | Specification |
|-----------|---------------|
| **RAM** | 8GB or more |
| **CPU** | Quad-core 3GHz+ |
| **Storage** | SSD for projects |
| **Audio Interface** | Professional audio interface with JACK/CoreAudio/ASIO |

---

## Installation Guide

### Linux Installation

#### Step 1: Install Dependencies
```bash
sudo apt update && sudo apt install build-essential cmake git pkg-config \
libasound2-dev libjack-jackd2-dev libfreetype6-dev libgtk-3-dev \
libwebkit2gtk-4.1-dev libcurl4-openssl-dev
```

#### Step 2: Clone and Build
```bash
git clone https://github.com/yourusername/signalforge.git
cd signalforge
git submodule update --init --recursive
./scripts/configure.sh
./scripts/build.sh
```

#### Step 3: Launch
```bash
./scripts/run.sh
```

#### Audio Setup (Optional)
For professional audio with JACK:
```bash
sudo apt install jackd2
jack_control start
```

### macOS Installation

#### Step 1: Install Prerequisites
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Homebrew (if needed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### Step 2: Clone and Build
```bash
git clone https://github.com/yourusername/signalforge.git
cd signalforge
git submodule update --init --recursive
./scripts/setup-macos.sh
./scripts/configure.sh
./scripts/build.sh
```

#### Step 3: Launch
```bash
# Command line
./scripts/run.sh

# Or launch app bundle
open ./build/SignalForge_artefacts/Debug/SignalForge.app
```

### Windows Installation

#### Step 1: Install Prerequisites
1. **Visual Studio 2019/2022** with C++ development tools
2. **CMake 3.22+** from cmake.org
3. **Git for Windows** from git-scm.com

#### Step 2: Build from Command Prompt
```cmd
git clone https://github.com/yourusername/signalforge.git
cd signalforge
git submodule update --init --recursive
mkdir build && cd build
cmake .. -G "Visual Studio 17 2022"
cmake --build . --config Debug
```

#### Step 3: Launch
```cmd
.\build\SignalForge_artefacts\Debug\SignalForge.exe
```

---

## Getting Started

### First Launch

1. **Start SignalForge** using the appropriate method for your platform
2. **Create a new project** by clicking the "New" button
3. **Set up audio preferences** in Settings if needed
4. **Load your first audio file** by dragging and dropping or using "Load File"

### Basic Workflow

1. **Import Audio**: Drag audio files onto the track view
2. **Record Audio**: Click the Record button to capture new audio
3. **Edit Tracks**: Use the timeline to arrange and edit audio
4. **Apply Effects**: Add EQ, compression, reverb, and other effects
5. **Mix**: Adjust levels, panning, and effects for each track
6. **Export**: Save your project or export final audio

---

## Interface Guide

### Main Window Layout

```
┌─────────────────────────────────────────────────────────┐
│ File Controls: [New] [Save] [Load] [Effects] [MIDI]    │
├─────────────────────────────────────────────────────────┤
│                Track Timeline View                      │
│ Track 1: ████████████████████████████                  │
│ Track 2: ████████████████████████████                  │
│ Track 3: ████████████████████████████                  │
├─────────────────────────────────────────────────────────┤
│              Waveform Display                           │
│         ╭─╮    ╭─╮    ╭─╮    ╭─╮                      │
│        ╱   ╲  ╱   ╲  ╱   ╲  ╱   ╲                     │
├─────────────────────────────────────────────────────────┤
│ Transport: [◄◄] [▶] [■] [●] Position: 00:00:00        │
├─────────────────────────────────────────────────────────┤
│ Mixer: [Vol] [Pan] [Mute] [Solo] per track             │
└─────────────────────────────────────────────────────────┘
```

### Control Elements

#### Top Toolbar
- **New**: Create a new project
- **Save**: Save current project as .sfp file
- **Load**: Open existing SignalForge project
- **Effects**: Open effects panel
- **MIDI**: Open MIDI device settings
- **Settings**: Application preferences

#### Transport Controls
- **◄◄**: Rewind to beginning
- **▶**: Play/Pause
- **■**: Stop playback
- **●**: Record audio
- **Position Display**: Current playback time

#### Track Controls (per track)
- **Volume Slider**: Adjust track level
- **Pan Knob**: Left/right stereo positioning
- **Mute Button**: Silence track
- **Solo Button**: Play only this track

---

## Audio Recording

### Setting Up Recording

1. **Connect Audio Interface**: Ensure your microphone or instrument is connected
2. **Check Input Levels**: Monitor input levels to avoid clipping
3. **Select Recording Track**: Click on the track where you want to record
4. **Arm Track**: Enable recording for the selected track

### Recording Process

1. **Click Record Button (●)**: Start recording
2. **Perform**: Play or sing your part
3. **Click Stop (■)**: End recording
4. **Review**: Listen to the recorded audio

### Recording Settings

- **Sample Rate**: 44.1kHz, 48kHz, 96kHz, 192kHz
- **Bit Depth**: 16-bit, 24-bit, 32-bit float
- **Buffer Size**: Adjust for latency vs. stability
- **Input Monitoring**: Real-time audio monitoring

### File Management

Recorded files are automatically saved to:
- **Linux/macOS**: `~/Documents/SignalForge/Recordings/`
- **Windows**: `%USERPROFILE%\Documents\SignalForge\Recordings\`

Files are timestamped: `Recording_YYYY-MM-DD_HH-MM-SS.wav`

---

## Multi-track Editing

### Loading Audio Files

#### Supported Formats
- **WAV**: Uncompressed audio (recommended)
- **MP3**: Compressed audio
- **AIFF**: Apple audio format
- **FLAC**: Lossless compression
- **OGG**: Open-source compressed format

#### Import Methods
1. **Drag & Drop**: Drag files from file manager onto track view
2. **Load File Button**: Use toolbar button to browse and select files
3. **Automatic Track Creation**: New tracks created as needed

### Track Management

#### Adding Tracks
- Tracks are created automatically when importing audio
- Each audio file gets its own track
- Maximum tracks limited by system resources

#### Track Operations
- **Move**: Drag tracks up/down to reorder
- **Rename**: Double-click track name to edit
- **Delete**: Right-click track for delete option
- **Duplicate**: Copy track with all settings

### Timeline Editing

#### Navigation
- **Zoom**: Mouse wheel or zoom controls
- **Scroll**: Horizontal scrollbar or arrow keys
- **Playhead**: Click timeline to set playback position

#### Selection and Editing
- **Select Region**: Click and drag on waveform
- **Cut/Copy/Paste**: Standard editing operations
- **Trim**: Adjust start/end points of audio regions
- **Split**: Divide audio regions at playhead position

---

## Effects & Processing

### Built-in Effects

SignalForge includes professional-quality effects:

#### Equalizer (EQ)
- **Low Shelf**: Boost/cut low frequencies
- **Mid Peak**: Parametric mid-frequency control
- **High Shelf**: Boost/cut high frequencies
- **Frequency Range**: 20Hz - 20kHz
- **Gain Range**: ±15dB

#### Compressor
- **Threshold**: Level where compression begins
- **Ratio**: Amount of compression (1:1 to 10:1)
- **Attack**: How quickly compression engages
- **Release**: How quickly compression disengages
- **Makeup Gain**: Compensate for level reduction

#### Reverb
- **Room Size**: Small room to large hall
- **Damping**: High-frequency absorption
- **Wet/Dry Mix**: Balance original and reverb signal
- **Pre-delay**: Time before reverb begins

#### Chorus
- **Rate**: Speed of modulation (0.1Hz - 10Hz)
- **Depth**: Amount of pitch modulation
- **Feedback**: Regeneration amount
- **Mix**: Wet/dry balance

#### Delay
- **Delay Time**: Echo timing (1ms - 2000ms)
- **Feedback**: Number of repeats
- **High Cut**: Filter for echo repeats
- **Mix**: Wet/dry balance

### Using Effects

1. **Open Effects Panel**: Click "Effects" button
2. **Enable Effect**: Check the effect you want to use
3. **Adjust Parameters**: Use sliders and knobs to shape sound
4. **Real-time Preview**: Hear changes immediately
5. **Per-track Processing**: Each track has independent effects

### Effect Chain Order

Effects are processed in this order:
1. EQ (Equalizer)
2. Compressor
3. Chorus
4. Delay
5. Reverb

---

## MIDI Support

### MIDI Setup

1. **Open MIDI Panel**: Click "MIDI" button in toolbar
2. **Select Input Device**: Choose MIDI keyboard or controller
3. **Select Output Device**: Choose MIDI sound module (if applicable)
4. **Test Connection**: Play keys to verify MIDI input

### MIDI Features

#### Input Monitoring
- Real-time MIDI message display
- Note on/off events
- Control change messages
- Program change detection

#### Supported MIDI Messages
- **Note On/Off**: Musical notes
- **Control Change**: Knobs, sliders, pedals
- **Program Change**: Instrument selection
- **Pitch Bend**: Pitch wheel data
- **Aftertouch**: Pressure sensitivity

### MIDI Recording

1. **Connect MIDI Device**: Ensure MIDI keyboard is connected
2. **Select MIDI Track**: Choose track for MIDI recording
3. **Arm Track**: Enable MIDI recording
4. **Record**: Click record and play MIDI device
5. **Playback**: MIDI data triggers internal sounds or external devices

---

## Project Management

### Project Files

SignalForge uses `.sfp` (SignalForge Project) files to store:
- Track arrangements
- Audio file references
- Effect settings
- Mixer configurations
- Timeline positions

### Saving Projects

1. **Click Save**: Use toolbar Save button
2. **Choose Location**: Select folder for project file
3. **Name Project**: Enter descriptive filename
4. **Automatic Backup**: Projects auto-save every 5 minutes

### Loading Projects

1. **Click Load**: Use toolbar Load button
2. **Browse Files**: Navigate to .sfp project file
3. **Open Project**: All tracks and settings restored
4. **Missing Files**: Dialog appears if audio files moved

### Project Organization

#### Recommended Folder Structure
```
MyProject/
├── MyProject.sfp          # Main project file
├── Audio/                 # Original audio files
│   ├── Drums.wav
│   ├── Bass.wav
│   └── Guitar.wav
├── Recordings/            # New recordings
│   └── Vocal_Take1.wav
└── Exports/               # Final mixdowns
    └── MyProject_Final.wav
```

### Export Options

#### Audio Export
- **Format**: WAV, AIFF
- **Sample Rate**: Match project or convert
- **Bit Depth**: 16-bit, 24-bit, 32-bit float
- **Channels**: Mono, Stereo

#### Export Process
1. **Set Export Range**: Select timeline region or full project
2. **Choose Format**: Select audio format and quality
3. **Name File**: Enter export filename
4. **Export**: Process and save final audio

---

## Troubleshooting

### Common Issues

#### Audio Not Playing
**Symptoms**: No sound output, silent playback
**Solutions**:
- Check audio device settings
- Verify system audio is working
- Restart SignalForge
- Check track mute/solo buttons

#### High Latency
**Symptoms**: Delay between input and output
**Solutions**:
- Reduce buffer size in audio settings
- Use ASIO drivers (Windows) or JACK (Linux)
- Close other audio applications
- Upgrade audio interface

#### Crackling/Dropouts
**Symptoms**: Audio glitches, pops, clicks
**Solutions**:
- Increase buffer size
- Close unnecessary applications
- Check CPU usage
- Use faster storage (SSD)

#### MIDI Not Working
**Symptoms**: MIDI keyboard not responding
**Solutions**:
- Check MIDI connections
- Verify device in MIDI settings
- Restart MIDI device
- Check MIDI channel settings

### Performance Optimization

#### System Settings
- **Close Background Apps**: Free up CPU and RAM
- **Disable WiFi**: Reduce system interruptions
- **Use Wired Connections**: Avoid wireless audio devices
- **Update Drivers**: Keep audio drivers current

#### SignalForge Settings
- **Buffer Size**: Balance latency vs. stability
- **Sample Rate**: Use project-appropriate rates
- **Track Count**: Limit active tracks if needed
- **Effect Usage**: Disable unused effects

### Getting Help

#### Log Files
SignalForge creates log files for troubleshooting:
- **Linux**: `~/.signalforge/logs/`
- **macOS**: `~/Library/Logs/SignalForge/`
- **Windows**: `%APPDATA%\SignalForge\Logs\`

#### Support Resources
- **GitHub Issues**: Report bugs and request features
- **Documentation**: Wiki and user guides
- **Community**: Forums and discussions

---

## Advanced Features

### Plugin Support

SignalForge supports industry-standard plugin formats:
- **VST3**: Virtual Studio Technology 3
- **AU**: Audio Units (macOS only)

#### Installing Plugins
1. **Download Plugins**: From manufacturer websites
2. **Install to Standard Locations**:
   - **Windows**: `C:\Program Files\Common Files\VST3\`
   - **macOS**: `/Library/Audio/Plug-Ins/VST3/`
   - **Linux**: `~/.vst3/`
3. **Scan Plugins**: SignalForge auto-detects on startup
4. **Use Plugins**: Available in effects menu

### Automation

#### Parameter Automation
- **Record Automation**: Move controls while recording
- **Draw Automation**: Create curves with mouse
- **Edit Points**: Adjust automation nodes
- **Copy/Paste**: Transfer automation between tracks

### Advanced Audio

#### High-Resolution Audio
- **Sample Rates**: Up to 192kHz
- **Bit Depths**: 32-bit floating point
- **Low Latency**: Sub-5ms monitoring
- **Professional I/O**: Multi-channel interfaces

#### Batch Processing
- **Multiple Files**: Process entire folders
- **Effect Chains**: Apply same effects to multiple tracks
- **Format Conversion**: Batch convert file formats
- **Normalization**: Automatic level matching

---

## Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| **New Project** | Ctrl+N | Cmd+N |
| **Save Project** | Ctrl+S | Cmd+S |
| **Load Project** | Ctrl+O | Cmd+O |
| **Play/Pause** | Spacebar | Spacebar |
| **Stop** | Enter | Enter |
| **Record** | R | R |
| **Undo** | Ctrl+Z | Cmd+Z |
| **Redo** | Ctrl+Y | Cmd+Y |
| **Cut** | Ctrl+X | Cmd+X |
| **Copy** | Ctrl+C | Cmd+C |
| **Paste** | Ctrl+V | Cmd+V |
| **Select All** | Ctrl+A | Cmd+A |
| **Zoom In** | Ctrl++ | Cmd++ |
| **Zoom Out** | Ctrl+- | Cmd+- |

---

## Technical Specifications

### Audio Engine
- **Architecture**: 64-bit floating point processing
- **Latency**: As low as 32 samples (0.7ms at 48kHz)
- **Dynamic Range**: >144dB
- **THD+N**: <0.0005%
- **Frequency Response**: 20Hz-20kHz ±0.1dB

### File Support
- **Import**: WAV, AIFF, MP3, FLAC, OGG
- **Export**: WAV, AIFF
- **Sample Rates**: 44.1, 48, 88.2, 96, 176.4, 192 kHz
- **Bit Depths**: 16, 24, 32-bit integer, 32-bit float

### System Integration
- **Audio APIs**: ALSA, JACK, CoreAudio, WASAPI, ASIO
- **Plugin Formats**: VST3, AU
- **MIDI**: Full MIDI 1.0 specification
- **Platforms**: Linux, macOS, Windows

---

## License & Credits

### License
SignalForge is released under the MIT License. See LICENSE file for details.

### Credits
- **JUCE Framework**: Cross-platform audio framework
- **Development Team**: SignalForge Audio
- **Contributors**: Open source community

### Third-Party Libraries
- **JUCE**: Audio framework and GUI
- **CMake**: Build system
- **Git**: Version control

---

**SignalForge DAW User Manual v0.1.0**  
**© 2026 SignalForge Audio**  
**For support: github.com/yourusername/signalforge**

---

*This manual covers SignalForge version 0.1.0. Features and interface may vary in different versions.*
