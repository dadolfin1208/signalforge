# SignalForge DAW with Integrated Base44 Frontend

A professional Digital Audio Workstation (DAW) built with JUCE, featuring integrated Base44 AI-powered mixing and mastering tools.

## 🎼 Architecture

### Native JUCE DAW
- **Location**: Root directory
- **Technology**: C++ with JUCE framework
- **Features**: Professional audio engine, transport controls, real-time processing
- **Build**: CMake build system for cross-platform compilation

### Integrated Web Interface
- **Location**: `WebInterface/` directory
- **Technology**: React + Vite + TypeScript
- **Features**: Advanced Base44 mixing/mastering tools, collaboration, analytics
- **Integration**: Launched from DAW via "🌐 Base44 Tools" button

## 🚀 Quick Start

### Build Native DAW
```bash
mkdir build && cd build
cmake ..
make -j4
```

### Run Web Interface
```bash
cd WebInterface
npm install
npm run dev
```

### Launch Complete System
```bash
# Start web interface (runs on localhost:5173)
./Scripts/start-base44.sh

# Launch DAW (connects to web interface)
./build/SignalForge_artefacts/Debug/SignalForge
```

## 🎯 Features

### Native DAW Features
- Professional transport controls (Play/Stop/Record)
- Real-time audio processing
- Direct Base44 API integration
- Professional UI with musical note branding
- Cross-platform executable

### Web Interface Features
- AI-powered mixing analysis
- Advanced mastering workflows
- Stem separation and processing
- Real-time collaboration tools
- Project management and analytics
- Professional UI components

## 🔧 Base44 Integration

- **App ID**: `6961194a8a60eaa48c2d5f19`
- **Direct API Calls**: Native JUCE buttons call Base44 functions
- **Hybrid Access**: Web interface for advanced features
- **Seamless Workflow**: One-click access between native and web tools

## 📁 Project Structure

```
signalforge/
├── Source/                 # JUCE DAW source code
├── Core/                   # Audio engine and API clients
├── Resources/              # Icons and assets
├── WebInterface/           # Base44 React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Application pages
│   │   └── api/            # Base44 API integration
│   └── package.json
├── Scripts/                # Build and deployment scripts
└── CMakeLists.txt         # Build configuration
```

## 🎵 Usage

1. **Launch Web Interface**: `./Scripts/start-base44.sh`
2. **Start DAW**: Run SignalForge executable
3. **Use Native Tools**: Transport controls, basic mixing
4. **Access Advanced Tools**: Click "🌐 Base44 Tools" for web interface
5. **Seamless Workflow**: Switch between native and web as needed

## 🔗 Integration Benefits

- **Best of Both Worlds**: Native performance + modern web UI
- **Unified Workflow**: Single application, multiple interfaces
- **Professional Grade**: Production-ready DAW with AI enhancement
- **Scalable Architecture**: Easy to extend and maintain
