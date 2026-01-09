# SignalForge DAW - Native API Documentation

## Overview

SignalForge is a native desktop Digital Audio Workstation built with JUCE framework. This documentation covers the internal API architecture and integration points for developers.

## Architecture

### Core Components

#### AudioEngine
```cpp
class AudioEngine {
public:
    void prepareToPlay(double sampleRate, int samplesPerBlock);
    void processBlock(juce::AudioBuffer<float>& buffer);
    void releaseResources();
    
    // Track management
    Track* addTrack();
    void removeTrack(int trackIndex);
    std::vector<Track*>& getTracks();
};
```

#### Track System
```cpp
class Track {
public:
    // Audio processing
    void processBlock(juce::AudioSampleBuffer& buffer);
    void prepareToPlay(double sampleRate, int samplesPerBlockExpected);
    
    // Plugin management
    PluginHost& getPluginHost();
    EffectsProcessor& getEffectsProcessor();
    
    // Properties
    void setVolume(float volume);
    void setPan(float pan);
    void setMute(bool mute);
    void setSolo(bool solo);
};
```

#### Plugin Host Integration
```cpp
class PluginHost {
public:
    // Plugin loading
    bool loadPlugin(const juce::String& pluginPath);
    void scanForPlugins();
    std::vector<PluginDescription> getAvailablePlugins();
    
    // Plugin management
    void addPluginToTrack(int trackIndex, const juce::String& pluginId);
    void removePluginFromTrack(int trackIndex, int pluginIndex);
    
    // Supported formats
    enum PluginFormat {
        VST3,
        AU,      // macOS only
        LV2,     // Linux primarily
        LADSPA   // Linux primarily
    };
};
```

## Native Integration Points

### 1. Audio Device Integration

#### JUCE Audio Device Manager
```cpp
class AudioDeviceManager {
    // Platform-specific audio drivers
    // Windows: WASAPI, ASIO
    // macOS: CoreAudio
    // Linux: ALSA, JACK
    
    void initialiseWithDefaultDevices(int numInputChannels, int numOutputChannels);
    void setAudioDeviceSetup(const AudioDeviceSetup& setup);
};
```

### 2. Plugin Format Support

#### VST3 Integration
```cpp
// Automatic scanning locations:
// Windows: C:\Program Files\Common Files\VST3\
// macOS: /Library/Audio/Plug-Ins/VST3/
// Linux: ~/.vst3/, /usr/lib/vst3/

class VST3PluginFormat : public AudioPluginFormat {
    StringArray searchPathsForPlugins(const FileSearchPath& directoriesToSearch, 
                                     bool recursive, bool allowPluginsWhichRequireAsynchronousInstantiation);
};
```

#### Audio Units (macOS)
```cpp
// Automatic scanning locations:
// /Library/Audio/Plug-Ins/Components/
// ~/Library/Audio/Plug-Ins/Components/

class AudioUnitPluginFormat : public AudioPluginFormat {
    void findAllTypesForFile(OwnedArray<PluginDescription>& results, const String& fileOrIdentifier);
};
```

#### LV2 (Linux)
```cpp
// Automatic scanning locations:
// ~/.lv2/, /usr/lib/lv2/, /usr/local/lib/lv2/

class LV2PluginFormat : public AudioPluginFormat {
    StringArray searchPathsForPlugins(const FileSearchPath& directoriesToSearch, bool recursive);
};
```

### 3. File Format Support

#### Project Files (.sfp)
```cpp
class ProjectManager {
public:
    bool saveProject(const juce::File& file);
    bool loadProject(const juce::File& file);
    
private:
    // JSON-based project format
    juce::var createProjectData();
    bool parseProjectData(const juce::var& data);
};
```

#### Audio File Support
```cpp
// Supported formats via JUCE AudioFormatManager:
// - WAV (uncompressed)
// - AIFF (uncompressed) 
// - FLAC (lossless compression)
// - OGG Vorbis (lossy compression)
// - MP3 (lossy compression, read-only)

class AudioFileManager {
    juce::AudioFormatManager formatManager;
    std::unique_ptr<juce::AudioFormatReader> createReaderFor(const juce::File& file);
};
```

## Platform-Specific Integration

### Windows Integration
```cpp
// Desktop entry via installer
// Registry entries for file associations
// ASIO driver support for professional audio interfaces

class WindowsIntegration {
    // File association for .sfp files
    void registerFileAssociation();
    
    // ASIO driver enumeration
    juce::StringArray getASIODriverNames();
};
```

### macOS Integration
```cpp
// App bundle structure
// Info.plist configuration
// CoreAudio integration
// Sandboxing considerations

class MacOSIntegration {
    // App bundle info
    void configureInfoPlist();
    
    // CoreAudio device enumeration
    juce::StringArray getCoreAudioDevices();
};
```

### Linux Integration
```cpp
// Desktop entry files
// JACK/ALSA integration
// Plugin path scanning

class LinuxIntegration {
    // Desktop file creation
    void createDesktopEntry(const juce::String& execPath);
    
    // JACK client management
    bool connectToJACK();
    void enumerateJACKPorts();
};
```

## API Extension Points

### 1. Custom Plugin Development
```cpp
// Extend SignalForge with custom plugins
class CustomPlugin : public juce::AudioProcessor {
public:
    void processBlock(juce::AudioBuffer<float>& buffer, juce::MidiBuffer& midiMessages) override;
    void prepareToPlay(double sampleRate, int samplesPerBlock) override;
    
    // Plugin metadata
    const juce::String getName() const override;
    bool acceptsMidi() const override;
    bool producesMidi() const override;
};
```

### 2. External Control Integration
```cpp
// MIDI controller integration
class MIDIController {
    void handleIncomingMidiMessage(juce::MidiInput* source, const juce::MidiMessage& message);
    
    // Map MIDI CC to DAW parameters
    void mapControllerToParameter(int ccNumber, juce::AudioProcessorParameter* param);
};

// OSC (Open Sound Control) integration potential
class OSCIntegration {
    void handleOSCMessage(const juce::String& address, const juce::var& value);
    void sendOSCMessage(const juce::String& address, const juce::var& value);
};
```

### 3. Scripting Integration (Future)
```cpp
// Potential JavaScript/Lua scripting support
class ScriptingEngine {
    bool executeScript(const juce::String& script);
    void registerAPIFunction(const juce::String& name, std::function<juce::var(const juce::var&)> func);
    
    // Expose DAW functions to scripts
    void exposeTrackAPI();
    void exposePluginAPI();
    void exposeTransportAPI();
};
```

## Build System Integration

### CMake Configuration
```cmake
# Plugin format support
option(SIGNALFORGE_BUILD_VST3 "Build VST3 support" ON)
option(SIGNALFORGE_BUILD_AU "Build Audio Unit support" ON)
option(SIGNALFORGE_BUILD_LV2 "Build LV2 support" ON)

# Platform-specific audio drivers
option(SIGNALFORGE_USE_JACK "Enable JACK support" ON)
option(SIGNALFORGE_USE_ASIO "Enable ASIO support" ON)
```

### Dependency Management
```cmake
# JUCE framework
find_package(PkgConfig REQUIRED)
add_subdirectory(ThirdParty/JUCE)

# Platform-specific dependencies
if(LINUX)
    pkg_check_modules(ALSA REQUIRED alsa)
    pkg_check_modules(JACK jack)
endif()
```

## Testing Framework

### Unit Tests
```cpp
class AudioEngineTest : public juce::UnitTest {
public:
    void runTest() override {
        beginTest("Audio Engine Initialization");
        
        AudioEngine engine;
        expect(engine.getSampleRate() > 0);
        expect(engine.getBlockSize() > 0);
    }
};
```

### Integration Tests
```cpp
class PluginHostTest : public juce::UnitTest {
    void testPluginLoading() {
        PluginHost host;
        host.scanForPlugins();
        expect(host.getAvailablePlugins().size() > 0);
    }
};
```

## Performance Considerations

### Real-time Audio Processing
```cpp
// Lock-free audio processing
class LockFreeAudioProcessor {
    // Use atomic operations for parameter changes
    std::atomic<float> volume{1.0f};
    std::atomic<bool> mute{false};
    
    // Avoid memory allocation in audio thread
    void processBlock(juce::AudioBuffer<float>& buffer) noexcept;
};
```

### Memory Management
```cpp
// Pre-allocated buffers for audio processing
class AudioBufferPool {
    std::vector<juce::AudioBuffer<float>> bufferPool;
    std::atomic<int> nextAvailableBuffer{0};
    
public:
    juce::AudioBuffer<float>* getBuffer();
    void returnBuffer(juce::AudioBuffer<float>* buffer);
};
```

## Security Considerations

### Plugin Sandboxing
```cpp
// Plugin validation and sandboxing
class PluginValidator {
    bool validatePlugin(const juce::String& pluginPath);
    bool checkPluginSignature(const juce::File& pluginFile);
    void sandboxPlugin(juce::AudioProcessor* plugin);
};
```

### File Access Control
```cpp
// Restrict file access for plugins
class SecureFileAccess {
    bool isPathAllowed(const juce::File& file);
    juce::File getSandboxedPath(const juce::File& requestedFile);
};
```

## Deployment

### Installer Integration
```cpp
// Windows NSIS installer
// macOS PKG installer  
// Linux AppImage/Flatpak

class InstallerAPI {
    void registerFileAssociations();
    void installPluginDirectories();
    void createDesktopShortcuts();
};
```

### Auto-Update System
```cpp
class UpdateManager {
    void checkForUpdates();
    bool downloadUpdate(const juce::String& updateURL);
    void applyUpdate();
};
```

---

## Getting Started for Developers

### 1. Build Environment Setup
```bash
# Clone repository
git clone https://github.com/yourusername/signalforge.git
cd signalforge
git submodule update --init --recursive

# Configure build
mkdir build && cd build
cmake .. -DSIGNALFORGE_BUILD_PLUGINS=ON

# Build
cmake --build . --config Debug
```

### 2. Plugin Development
```bash
# Create new plugin project
mkdir MyPlugin
cd MyPlugin

# Use JUCE Projucer or CMake template
# Implement AudioProcessor interface
# Build as VST3/AU/LV2
```

### 3. Contributing
```bash
# Fork repository
# Create feature branch
# Implement changes
# Add tests
# Submit pull request
```

---

**SignalForge Native API Documentation v0.1.0**  
**© 2026 SignalForge Audio**  
**For development support: github.com/yourusername/signalforge**
