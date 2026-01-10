#pragma once

#include <JuceHeader.h>
#include "AudioEngine/AudioEngine.h"

// Forward declarations
class TrackView;
class MixerPanel;
class TransportControls;
class MidiSettingsPanel;
class EffectsPanel;
class PluginBrowser;
class WaveformDisplay;
class AudioRecorder;
class ProjectManager;

class MainComponent final : public juce::Component,
                            public juce::Timer
{
public:
    MainComponent();
    ~MainComponent() override;

    void paint(juce::Graphics& g) override;
    void resized() override;
    void timerCallback() override;

private:
    // API callbacks
    void handleAuthStateChanged(bool authenticated);
    void handleProcessingComplete(const String& type, var result);
    AudioEngine audioEngine;

    // GUI Components
    std::unique_ptr<TrackView> trackView;
    std::unique_ptr<MixerPanel> mixerPanel;
    std::unique_ptr<TransportControls> transportControls;
    std::unique_ptr<MidiSettingsPanel> midiSettingsPanel;
    std::unique_ptr<EffectsPanel> effectsPanel;
    std::unique_ptr<PluginBrowser> pluginBrowser;
    std::unique_ptr<WaveformDisplay> waveformDisplay;
    
    // Managers
    std::unique_ptr<AudioRecorder> audioRecorder;
    std::unique_ptr<ProjectManager> projectManager;
    
    // Buttons
    std::unique_ptr<juce::TextButton> newProjectButton;
    std::unique_ptr<juce::TextButton> saveProjectButton;
    std::unique_ptr<juce::TextButton> loadProjectButton;
    std::unique_ptr<juce::TextButton> settingsButton;
    std::unique_ptr<juce::TextButton> pluginsButton;
    std::unique_ptr<juce::TextButton> effectsButton;
    std::unique_ptr<juce::TextButton> midiButton;
    std::unique_ptr<juce::TextButton> loadFileButton;
    std::unique_ptr<juce::FileChooser> fileChooser;

    // Status labels
    juce::Label sampleRateLabel;
    juce::Label bufferSizeLabel;
    juce::Label deviceNameLabel;
    juce::Label cpuUsageLabel;
    juce::Label activeChannelsLabel;

    // Audio settings
    juce::AudioDeviceSelectorComponent audioSettingsComponent;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(MainComponent)
};