#include "MainComponent.h"
#include "../Core/API/APIManager.h"
#include "../Core/Auth/ProtocolHandler.h"
#include "GUI/TrackView.h"
#include "GUI/MixerPanel.h"
#include "GUI/TransportControls.h"
#include "GUI/MidiSettingsPanel.h"
#include "GUI/EffectsPanel.h"
#include "GUI/PluginBrowser.h"
#include "GUI/WaveformDisplay.h"
#include "AudioEngine/Track.h"
#include "AudioEngine/PluginHost.h"
#include "AudioEngine/AudioRecorder.h"
#include "AudioEngine/ProjectManager.h"

MainComponent::MainComponent()
    : audioSettingsComponent (audioEngine.getDeviceManager(),
                              0, 2, // min/max input channels
                              0, 2, // min/max output channels
                              false, // can select MIDI inputs
                              false, // can select MIDI outputs
                              false, // do not show device properties box
                              false) // do not show midi options
{
    // Create GUI components
    trackView = std::make_unique<TrackView>();
    mixerPanel = std::make_unique<MixerPanel>();
    transportControls = std::make_unique<TransportControls>();
    midiSettingsPanel = std::make_unique<MidiSettingsPanel>(audioEngine.getMidiManager());
    effectsPanel = std::make_unique<EffectsPanel>();
    pluginBrowser = std::make_unique<PluginBrowser>();
    waveformDisplay = std::make_unique<WaveformDisplay>();
    
    // Create managers
    audioRecorder = std::make_unique<AudioRecorder>();
    projectManager = std::make_unique<ProjectManager>(audioEngine);
    
    // Initialize API
    auto& apiManager = APIManager::getInstance();
    apiManager.onAuthStateChanged = [this](bool authenticated) {
        handleAuthStateChanged(authenticated);
    };
    
    apiManager.onProcessingComplete = [this](const String& type, var result) {
        handleProcessingComplete(type, result);
    };
    
    // Register protocol handler
    ProtocolHandler::registerProtocol();
    
    // Add main GUI components
    addAndMakeVisible(*trackView);
    addAndMakeVisible(*mixerPanel);
    addAndMakeVisible(*transportControls);
    addAndMakeVisible(*waveformDisplay);
    
    // Audio and MIDI settings (initially hidden)
    addChildComponent(audioSettingsComponent);
    addChildComponent(*midiSettingsPanel);
    addChildComponent(*effectsPanel);
    addChildComponent(*pluginBrowser);
    
    // Status labels
    addAndMakeVisible(sampleRateLabel);
    addAndMakeVisible(bufferSizeLabel);
    addAndMakeVisible(deviceNameLabel);
    addAndMakeVisible(cpuUsageLabel);
    addAndMakeVisible(activeChannelsLabel);
    
    // Project buttons
    newProjectButton = std::make_unique<juce::TextButton>("New");
    saveProjectButton = std::make_unique<juce::TextButton>("Save");
    loadProjectButton = std::make_unique<juce::TextButton>("Load");
    
    addAndMakeVisible(*newProjectButton);
    addAndMakeVisible(*saveProjectButton);
    addAndMakeVisible(*loadProjectButton);
    
    newProjectButton->onClick = [this]() { projectManager->newProject(); };
    
    saveProjectButton->onClick = [this]() {
        auto projectsDir = juce::File::getSpecialLocation(juce::File::userDocumentsDirectory)
                          .getChildFile("SignalForge/Projects");
        auto projectFile = projectsDir.getChildFile(projectManager->getProjectName() + ".sfp");
        projectManager->saveProject(projectFile);
    };
    
    loadProjectButton->onClick = [this]() {
        fileChooser = std::make_unique<juce::FileChooser>("Load SignalForge Project",
                                                          juce::File{}, "*.sfp");
        fileChooser->launchAsync(juce::FileBrowserComponent::openMode,
                                [this](const juce::FileChooser& chooser) {
                                    auto file = chooser.getResult();
                                    if (file.existsAsFile())
                                        projectManager->loadProject(file);
                                });
    };
    // Settings button
    settingsButton = std::make_unique<juce::TextButton>("Settings");
    addAndMakeVisible(*settingsButton);
    settingsButton->onClick = [this]() { 
        audioSettingsComponent.setVisible(!audioSettingsComponent.isVisible());
        resized();
    };
    
    // Plugins button
    pluginsButton = std::make_unique<juce::TextButton>("Plugins");
    addAndMakeVisible(*pluginsButton);
    pluginsButton->onClick = [this]() { 
        pluginBrowser->setVisible(!pluginBrowser->isVisible());
        
        // Connect to first track's plugin host
        if (audioEngine.getNumTracks() > 0)
        {
            if (auto* track = audioEngine.getTrack(0))
                pluginBrowser->setPluginHost(&track->getPluginHost());
        }
        
        resized();
    };
    // Effects button
    effectsButton = std::make_unique<juce::TextButton>("Effects");
    addAndMakeVisible(*effectsButton);
    effectsButton->onClick = [this]() { 
        effectsPanel->setVisible(!effectsPanel->isVisible());
        
        // Connect to first track's effects processor
        if (audioEngine.getNumTracks() > 0)
        {
            if (auto* track = audioEngine.getTrack(0))
                effectsPanel->setEffectsProcessor(&track->getEffectsProcessor());
        }
        
        resized();
    };
    // MIDI button
    midiButton = std::make_unique<juce::TextButton>("MIDI");
    addAndMakeVisible(*midiButton);
    midiButton->onClick = [this]() { 
        midiSettingsPanel->setVisible(!midiSettingsPanel->isVisible());
        resized();
    };
    // Load file button
    loadFileButton = std::make_unique<juce::TextButton>("Load File");
    addAndMakeVisible(*loadFileButton);
    loadFileButton->onClick = [this]() {
        fileChooser = std::make_unique<juce::FileChooser>("Select audio file to load",
                                                          juce::File{},
                                                          "*.wav;*.mp3;*.aiff;*.flac;*.ogg");
        
        fileChooser->launchAsync(juce::FileBrowserComponent::openMode | juce::FileBrowserComponent::canSelectFiles,
                                [this](const juce::FileChooser& chooser) {
                                    auto file = chooser.getResult();
                                    if (file.existsAsFile())
                                    {
                                        // Load into first available track
                                        int trackIndex = 0;
                                        if (audioEngine.getNumTracks() == 0)
                                            audioEngine.addTrack("Track 1");
                                        
                                        if (auto* track = audioEngine.getTrack(trackIndex))
                                        {
                                            track->loadAudioFile(file);
                                            juce::Logger::writeToLog("Loaded " + file.getFileName() + " into track " + juce::String(trackIndex + 1));
                                        }
                                    }
                                });
    };
    
    // Connect transport controls to audio engine
    transportControls->onPlayClicked = [this]() { audioEngine.play(); };
    transportControls->onStopClicked = [this]() { audioEngine.stop(); };
    transportControls->onRecordClicked = [this]() {
        if (audioRecorder->isRecording())
        {
            audioRecorder->stopRecording();
        }
        else
        {
            auto recordingsDir = juce::File::getSpecialLocation(juce::File::userDocumentsDirectory)
                                .getChildFile("SignalForge/Recordings");
            auto timestamp = juce::Time::getCurrentTime().formatted("%Y%m%d_%H%M%S");
            auto recordFile = recordingsDir.getChildFile("Recording_" + timestamp + ".wav");
            audioRecorder->startRecording(recordFile);
        }
    };
    
    // Connect file loading
    trackView->onFileDropped = [this](const juce::File& file, int trackIndex) {
        // Ensure we have enough tracks
        while (audioEngine.getNumTracks() <= trackIndex)
        {
            audioEngine.addTrack("Track " + juce::String(audioEngine.getNumTracks() + 1));
        }
        
        // Load file into track and waveform display
        if (auto* track = audioEngine.getTrack(trackIndex))
        {
            track->loadAudioFile(file);
            waveformDisplay->loadAudioFile(file);
            juce::Logger::writeToLog("Loaded " + file.getFileName() + " into track " + juce::String(trackIndex + 1));
        }
    };
    
    // Connect plugin loading
    pluginBrowser->onPluginSelected = [this](const juce::PluginDescription& description) {
        if (audioEngine.getNumTracks() > 0)
        {
            if (auto* track = audioEngine.getTrack(0))
            {
                if (track->getPluginHost().loadPlugin(description))
                {
                    juce::Logger::writeToLog("Loaded plugin: " + description.name + " into track 1");
                }
            }
        }
    };

    // Add some test tracks
    audioEngine.addTrack("Track 1");
    audioEngine.addTrack("Track 2");

    setSize(1200, 800);
    startTimerHz(1);
}

MainComponent::~MainComponent()
{
    stopTimer();
}

void MainComponent::paint(juce::Graphics& g)
{
    g.fillAll(getLookAndFeel().findColour(juce::ResizableWindow::backgroundColourId));
}

void MainComponent::resized()
{
    auto bounds = getLocalBounds();
    
    // Status bar at top
    auto statusArea = bounds.removeFromTop(25);
    auto statusWidth = statusArea.getWidth() / 5;
    sampleRateLabel.setBounds(statusArea.removeFromLeft(statusWidth));
    bufferSizeLabel.setBounds(statusArea.removeFromLeft(statusWidth));
    deviceNameLabel.setBounds(statusArea.removeFromLeft(statusWidth));
    cpuUsageLabel.setBounds(statusArea.removeFromLeft(statusWidth));
    activeChannelsLabel.setBounds(statusArea.removeFromLeft(statusWidth));
    
    // Settings button in top right
    auto topRight = bounds.removeFromRight(640).removeFromTop(30);
    newProjectButton->setBounds(topRight.removeFromLeft(60));
    saveProjectButton->setBounds(topRight.removeFromLeft(60));
    loadProjectButton->setBounds(topRight.removeFromLeft(60));
    settingsButton->setBounds(topRight.removeFromLeft(80));
    pluginsButton->setBounds(topRight.removeFromLeft(80));
    effectsButton->setBounds(topRight.removeFromLeft(80));
    midiButton->setBounds(topRight.removeFromLeft(80));
    loadFileButton->setBounds(topRight.removeFromLeft(80));
    
    // Audio and MIDI settings panels (when visible)
    if (audioSettingsComponent.isVisible())
    {
        audioSettingsComponent.setBounds(bounds.removeFromTop(250));
    }
    
    if (midiSettingsPanel->isVisible())
    {
        midiSettingsPanel->setBounds(bounds.removeFromTop(130));
    }
    
    if (effectsPanel->isVisible())
    {
        effectsPanel->setBounds(bounds.removeFromTop(410));
    }
    
    if (pluginBrowser->isVisible())
    {
        pluginBrowser->setBounds(bounds.removeFromTop(310));
    }
    
    // Transport controls at bottom
    transportControls->setBounds(bounds.removeFromBottom(60));
    
    // Waveform display above transport
    waveformDisplay->setBounds(bounds.removeFromBottom(100));
    
    // Mixer panel on right
    mixerPanel->setBounds(bounds.removeFromRight(300));
    
    // Track view takes remaining space
    trackView->setBounds(bounds);
}

void MainComponent::timerCallback()
{
    auto& deviceManager = audioEngine.getDeviceManager();
    auto* device = deviceManager.getCurrentAudioDevice();
    if (device != nullptr)
    {
        sampleRateLabel.setText("Sample Rate: " + juce::String(device->getCurrentSampleRate()) + " Hz", juce::dontSendNotification);
        bufferSizeLabel.setText("Buffer Size: " + juce::String(device->getCurrentBufferSizeSamples()) + " samples", juce::dontSendNotification);
        deviceNameLabel.setText("Device: " + device->getName(), juce::dontSendNotification);
        cpuUsageLabel.setText("CPU Usage: " + juce::String(deviceManager.getCpuUsage() * 100, 2) + " %", juce::dontSendNotification);

        auto activeIns = device->getActiveInputChannels();
        auto activeOuts = device->getActiveOutputChannels();
        activeChannelsLabel.setText("Channels: " + juce::String(activeIns.countNumberOfSetBits()) + " in, " + juce::String(activeOuts.countNumberOfSetBits()) + " out", juce::dontSendNotification);
    }
    else
    {
        sampleRateLabel.setText("Sample Rate: N/A", juce::dontSendNotification);
        bufferSizeLabel.setText("Buffer Size: N/A", juce::dontSendNotification);
        deviceNameLabel.setText("Device: None", juce::dontSendNotification);
        cpuUsageLabel.setText("CPU Usage: N/A", juce::dontSendNotification);
        activeChannelsLabel.setText("Channels: N/A", juce::dontSendNotification);
    }
}

void MainComponent::handleAuthStateChanged(bool authenticated) {
    if (authenticated) {
        DBG("User authenticated successfully");
        // Update UI to show authenticated state
    } else {
        DBG("User authentication failed or logged out");
        // Update UI to show unauthenticated state
    }
}

void MainComponent::handleProcessingComplete(const String& type, var result) {
    DBG("Processing complete: " + type);
    
    if (type == "mixing") {
        // Handle mixing results
        if (result.hasProperty("suggestions")) {
            DBG("Mixing suggestions received");
        }
    } else if (type == "mastering") {
        // Handle mastering results
        if (result.hasProperty("processed_file_url")) {
            String processedUrl = result["processed_file_url"].toString();
            DBG("Mastered file available: " + processedUrl);
        }
    } else if (type == "stems") {
        // Handle stem separation results
        if (result.hasProperty("stems")) {
            var stems = result["stems"];
            DBG("Stems separated successfully");
        }
    }
}