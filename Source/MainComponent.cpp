#include "MainComponent.h"
#include <iostream>

MainComponent::MainComponent()
    : audioSettingsComponent (audioEngine.getDeviceManager(),
                              0, 2, // min/max input channels
                              0, 2, // min/max output channels
                              false, // can select MIDI inputs
                              false, // can select MIDI outputs
                              false, // do not show device properties box
                              false), // do not show midi options
      statusLabel ("", "Idle")
{
    addAndMakeVisible(sampleRateLabel);
    addAndMakeVisible(bufferSizeLabel);
    addAndMakeVisible(deviceNameLabel);
    addAndMakeVisible(cpuUsageLabel);
    addAndMakeVisible(activeChannelsLabel);

    addAndMakeVisible (audioSettingsComponent);

    addAndMakeVisible(recordButton);
    addAndMakeVisible(statusLabel);

    recordButton.addListener(this);
    recordButton.setColour(juce::TextButton::buttonColourId, juce::Colours::green.withAlpha(0.7f));
    recordButton.setColour(juce::TextButton::buttonOnColourId, juce::Colours::red.withAlpha(0.7f));

    statusLabel.setText("Idle", juce::dontSendNotification);

    setSize(600, 500); // Increased size to accommodate new controls
    startTimerHz(1); // Update once per second
}

void MainComponent::initialiseAudio()
{
    audioSourcePlayer.setSource(&audioEngine); // MainComponent's player now plays audioEngine

    juce::String error = audioEngine.getDeviceManager().initialise (2, 2, nullptr, true, juce::String(), nullptr);
    if (error.isNotEmpty())
    {
        juce::AlertWindow::showMessageBoxAsync(juce::AlertWindow::WarningIcon,
                                              "Audio Device Error",
                                              "Failed to initialise audio device: " + error);
        juce::JUCEApplication::getInstance()->systemRequestedQuit(); // Request app to quit on critical error
    }
    else
    {
        audioEngine.getDeviceManager().addAudioCallback(&audioSourcePlayer);
    }
}

MainComponent::~MainComponent()
{
    stopTimer();
    audioEngine.stopRecording(); // Ensure recording is stopped on shutdown

    audioEngine.getDeviceManager().removeAudioCallback(&audioSourcePlayer);
    audioSourcePlayer.setSource(nullptr);
}

void MainComponent::paint(juce::Graphics& g)
{
    g.fillAll(getLookAndFeel().findColour(juce::ResizableWindow::backgroundColourId));
}

void MainComponent::resized()
{
    auto area = getLocalBounds().reduced(10);

    audioSettingsComponent.setBounds (area.removeFromTop (200)); // Allocate space for selector

    sampleRateLabel.setBounds(area.removeFromTop(20));
    bufferSizeLabel.setBounds(area.removeFromTop(20));
        deviceNameLabel.setBounds(area.removeFromTop(20));
    cpuUsageLabel.setBounds(area.removeFromTop(20));
    activeChannelsLabel.setBounds(area.removeFromTop(20));

    recordButton.setBounds(area.removeFromTop(30).reduced(area.getWidth() / 4, 0));
    statusLabel.setBounds(area.removeFromTop(30));
}

void MainComponent::timerCallback()
{
    // Update UI elements with audio engine status
    sampleRateLabel.setText("Sample Rate: " + juce::String(audioEngine.getSampleRate()), juce::dontSendNotification);
    bufferSizeLabel.setText("Buffer Size: " + juce::String(audioEngine.getBufferSize()), juce::dontSendNotification);
    deviceNameLabel.setText("Device: " + audioEngine.getDeviceName(), juce::dontSendNotification);
    cpuUsageLabel.setText("CPU Usage: " + juce::String(audioEngine.getCpuUsage() * 100, 2) + "%", juce::dontSendNotification);
    activeChannelsLabel.setText("Active Input Channels: " + juce::String(audioEngine.getActiveInputChannels()) +
                                 ", Active Output Channels: " + juce::String(audioEngine.getActiveOutputChannels()), juce::dontSendNotification);
}

void MainComponent::buttonClicked(juce::Button* button)
{
    if (button == &recordButton)
    {
        if (recordButton.getToggleState()) // If record button is ON, start recording
        {
            juce::File recordingFolder = juce::File::getSpecialLocation(juce::File::userHomeDirectory).getChildFile("SignalForgeRecordings");
            if (!recordingFolder.exists())
            {
                recordingFolder.createDirectory();
            }

            juce::String timeStamp = juce::Time::getCurrentTime().formatted("%Y-%m-%d_%H-%M-%S");
            juce::File outputFile = recordingFolder.getChildFile("Recording_" + timeStamp + ".wav");

            // Use FileChooser to let the user pick a location
            juce::FileChooser chooser("Save Recording",
                                      outputFile,
                                      "*.wav",
                                      true); // true to show 'save' dialog

            chooser.launchAsync(juce::FileBrowserComponent::saveMode,
                                  [this, originalRecordButtonState = recordButton.getToggleState()](const juce::FileChooser& fc) mutable
            {
                juce::File chosenFile = fc.getResult();

                if (chosenFile.existsAsFile())
                {
                    audioEngine.startRecording(chosenFile);

                    if (audioEngine.isRecording())
                    {
                        statusLabel.setText("Recording to: " + chosenFile.getFileName(), juce::dontSendNotification);
                        recordButton.setButtonText("Stop");
                    }
                    else
                    {
                        statusLabel.setText("Error starting recording!", juce::dontSendNotification);
                        recordButton.setToggleState(false, juce::dontSendNotification); // Revert toggle state
                        recordButton.setButtonText("Record");
                    }
                }
                else
                {
                    // User cancelled the file dialog
                    recordButton.setToggleState(false, juce::dontSendNotification); // Revert toggle state
                    recordButton.setButtonText("Record");
                    statusLabel.setText("Recording cancelled.", juce::dontSendNotification);
                }
            });
        }
        else // If record button is OFF, stop recording
        {
            audioEngine.stopRecording();
            statusLabel.setText("Idle", juce::dontSendNotification);
            recordButton.setButtonText("Record");
        }
    }
}