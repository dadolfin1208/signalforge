# SignalForge Plugins Guide

Complete guide to installing and using audio plugins with SignalForge DAW.

## Quick Installation

### 🚀 Automatic Installation (Linux)
```bash
# Navigate to SignalForge directory first
cd ~/signalforge

# Run the plugin installer script
./scripts/install-plugins.sh
```

### 🍎 macOS Installation
```bash
# Install Homebrew plugins
brew install --cask surge-synthesizer
brew install calf

# Manual plugin locations:
# VST3: /Library/Audio/Plug-Ins/VST3/
# AU: /Library/Audio/Plug-Ins/Components/
```

### 🪟 Windows Installation
Download and install plugins manually to:
- VST3: `C:\Program Files\Common Files\VST3\`

---

## 🆓 Free Plugin Recommendations

### Essential Effects Pack

#### Calf Studio Gear
- **What**: Professional effects suite
- **Includes**: EQ, Compressor, Reverb, Delay, Chorus, Flanger, Phaser
- **Install**: `sudo apt install calf-plugins`
- **License**: LGPL (Free)

#### LSP Plugins
- **What**: High-quality mixing and mastering tools
- **Includes**: Parametric EQ, Multiband Compressor, Limiter, Analyzer
- **Download**: [lsp-plug.in](https://lsp-plug.in)
- **Install**: Download .deb package
- **License**: LGPL (Free)

#### TAL Plugins
- **What**: Vintage synthesizers and effects
- **Includes**: TAL-Reverb-4, TAL-Chorus-LX, TAL-Filter
- **Download**: [tal-software.com](https://tal-software.com)
- **License**: Free for non-commercial use

### Synthesizers

#### Surge Synthesizer
- **What**: Powerful wavetable synthesizer
- **Features**: 400+ presets, advanced modulation
- **Install**: `sudo apt install surge-synthesizer`
- **License**: GPL (Free)

#### Helm Synthesizer
- **What**: Polyphonic synthesizer
- **Features**: 32-voice polyphony, extensive modulation
- **Download**: [tytel.org/helm](https://tytel.org/helm)
- **License**: GPL (Free)

### LADSPA Plugin Collection

#### SWH Plugins
- **What**: Classic LADSPA effects
- **Includes**: Reverb, Delay, Filters, Distortion
- **Install**: `sudo apt install swh-plugins`

#### TAP Plugins
- **What**: Tom's Audio Processing plugins
- **Includes**: Reverb, Delay, Dynamics
- **Install**: `sudo apt install tap-plugins`

---

## 💰 Commercial Plugin Recommendations

### Professional Effects

#### FabFilter Pro-Q 3
- **What**: Professional EQ
- **Price**: $179
- **Features**: Dynamic EQ, spectrum analyzer
- **Download**: [fabfilter.com](https://fabfilter.com)

#### Waves Gold Bundle
- **What**: Industry-standard effects
- **Price**: $199 (often on sale)
- **Includes**: SSL, API, Renaissance series
- **Download**: [waves.com](https://waves.com)

#### iZotope Ozone Elements
- **What**: Mastering suite
- **Price**: $129
- **Features**: EQ, Compressor, Maximizer
- **Download**: [izotope.com](https://izotope.com)

### Synthesizers

#### Serum
- **What**: Wavetable synthesizer
- **Price**: $189
- **Features**: Visual wavetable editor
- **Download**: [xferrecords.com](https://xferrecords.com)

#### Massive X
- **What**: Advanced synthesizer
- **Price**: $199
- **Features**: Routing matrix, effects
- **Download**: [native-instruments.com](https://native-instruments.com)

---

## 📁 Plugin Installation Locations

### Linux
```
VST3:     ~/.vst3/
          /usr/lib/vst3/
LV2:      ~/.lv2/
          /usr/lib/lv2/
LADSPA:   ~/.ladspa/
          /usr/lib/ladspa/
```

### macOS
```
VST3:     /Library/Audio/Plug-Ins/VST3/
          ~/Library/Audio/Plug-Ins/VST3/
AU:       /Library/Audio/Plug-Ins/Components/
          ~/Library/Audio/Plug-Ins/Components/
```

### Windows
```
VST3:     C:\Program Files\Common Files\VST3\
          C:\Program Files (x86)\Common Files\VST3\
```

---

## 🔧 Using Plugins in SignalForge

### Loading Plugins
1. **Open Plugin Browser**: Click "Plugins" button in toolbar
2. **Browse Categories**: Effects, Instruments, Generators
3. **Load Plugin**: Double-click or drag onto track
4. **Adjust Parameters**: Use plugin's built-in interface

### Plugin Management
- **Scan for New Plugins**: Restart SignalForge after installation
- **Plugin Presets**: Save/load plugin settings
- **CPU Usage**: Monitor performance in mixer
- **Plugin Chain**: Multiple plugins per track supported

### Troubleshooting
- **Plugin Not Appearing**: Check installation path
- **Audio Dropouts**: Increase buffer size
- **Crashes**: Update plugin to latest version
- **Licensing**: Ensure plugin is properly activated

---

## 🎛️ Plugin Categories

### Dynamics
- **Compressors**: Control dynamic range
- **Limiters**: Prevent clipping
- **Gates**: Remove noise between sounds
- **Expanders**: Increase dynamic range

### EQ & Filters
- **Parametric EQ**: Precise frequency control
- **Graphic EQ**: Visual frequency bands
- **High/Low Pass**: Remove unwanted frequencies
- **Notch Filters**: Remove specific frequencies

### Time-Based Effects
- **Reverb**: Add space and ambience
- **Delay**: Echo and repeat effects
- **Chorus**: Thicken and widen sounds
- **Flanger/Phaser**: Sweeping modulation effects

### Modulation
- **Tremolo**: Amplitude modulation
- **Vibrato**: Pitch modulation
- **Ring Modulator**: Frequency modulation
- **Auto-Pan**: Stereo movement

### Distortion
- **Overdrive**: Warm saturation
- **Distortion**: Aggressive clipping
- **Fuzz**: Vintage-style distortion
- **Bit Crusher**: Digital degradation

### Utility
- **Analyzers**: Spectrum and level meters
- **Tuners**: Pitch detection
- **Metronomes**: Timing reference
- **Test Generators**: Sine waves, noise

---

## 📊 Plugin Performance Tips

### Optimization
- **Freeze Tracks**: Render plugin processing to audio
- **Bypass Unused**: Disable plugins not in use
- **Buffer Settings**: Balance latency vs. stability
- **Sample Rate**: Match project settings

### CPU Management
- **Plugin Delay Compensation**: Automatic in SignalForge
- **Multi-core Usage**: Modern plugins use multiple cores
- **RAM Usage**: Large sample libraries need sufficient RAM
- **Storage**: Use SSD for sample streaming

---

## 🔗 Plugin Resources

### Free Plugin Databases
- **KVR Audio**: [kvraudio.com](https://kvraudio.com) - Comprehensive plugin database
- **Plugin Boutique**: [pluginboutique.com](https://pluginboutique.com) - Free plugins section
- **Bedroom Producers Blog**: [bedroomproducersblog.com](https://bedroomproducersblog.com) - Free plugin reviews

### Learning Resources
- **Plugin manuals**: Always read the documentation
- **YouTube tutorials**: Search "[plugin name] tutorial"
- **Producer forums**: Gearspace, VI-Control, KVR forums
- **Preset sharing**: Many plugins have user preset libraries

### Support
- **Plugin Issues**: Contact plugin manufacturer
- **SignalForge Integration**: Report issues on GitHub
- **Community Help**: SignalForge Discord/forums

---

## ⚖️ Legal Considerations

### Licensing
- **Read EULAs**: Understand usage rights
- **Commercial vs. Personal**: Some plugins restrict commercial use
- **Redistribution**: Never share plugin files
- **Cracked Plugins**: Illegal and potentially harmful

### Best Practices
- **Buy Legitimate**: Support plugin developers
- **Keep Receipts**: For license verification
- **Backup Licenses**: Save activation codes
- **Update Regularly**: Get bug fixes and new features

---

## 🚀 Getting Started Workflow

### Beginner Setup (Free)
1. Navigate to project: `cd signalforge`
2. Run `./scripts/install-plugins.sh`
3. Install Surge Synthesizer manually (optional)
4. Download TAL free plugins (optional)
5. Start with Calf Studio Gear effects

**What You Get**: 156+ LADSPA plugins, Calf Studio Gear professional effects

### Intermediate Setup
1. Add LSP Plugins for mixing
2. Get Helm synthesizer
3. Try commercial plugin demos
4. Learn advanced routing techniques

### Professional Setup
1. Invest in quality commercial plugins
2. Build preset libraries
3. Create plugin templates
4. Optimize system for low latency

### Troubleshooting Plugin Installation

#### Common Issues
- **Script not found**: Make sure you're in the `signalforge` directory
- **Permission denied**: Run `chmod +x scripts/install-plugins.sh`
- **Surge not available**: Install manually from surge-synthesizer.github.io
- **Plugins not appearing**: Restart SignalForge after installation

---

**Last Updated**: January 2026  
**SignalForge Version**: 0.1.0  
**Plugin Compatibility**: VST3, AU, LV2, LADSPA
