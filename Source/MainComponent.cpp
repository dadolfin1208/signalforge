#include "MainComponent.h"

MainComponent::MainComponent()
    : audioSettingsComponent (audioEngine.getDeviceManager(),
                              0, 2, // min/max input channels
                              0, 2, // min/max output channels
                              false, // can select MIDI inputs
                              false, // can select MIDI outputs
                              false, // do not show device properties box
                              false) // do not show midi options
{
    addAndMakeVisible(sampleRateLabel);
    addAndMakeVisible(bufferSizeLabel);
    addAndMakeVisible(deviceNameLabel);
    addAndMakeVisible(cpuUsageLabel);
    addAndMakeVisible(activeChannelsLabel);

    addAndMakeVisible (audioSettingsComponent);

    setSize(600, 400); // Increased size to accommodate device selector
    startTimerHz(1); // Update once per second
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
    auto area = getLocalBounds().reduced(10);

    audioSettingsComponent.setBounds (area.removeFromTop (200)); // Allocate space for selector

    sampleRateLabel.setBounds(area.removeFromTop(20));
    bufferSizeLabel.setBounds(area.removeFromTop(20));
    deviceNameLabel.setBounds(area.removeFromTop(20));
    cpuUsageLabel.setBounds(area.removeFromTop(20));
    activeChannelsLabel.setBounds(area.removeFromTop(20));
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