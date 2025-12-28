#include "MainComponent.h"

MainComponent::MainComponent()
{
    // Start with something conservative.
    // If you have XR18 connected, you can later set preferred device.
    deviceManager.initialiseWithDefaultDevices(2, 2);

    setSize(900, 500);
}

MainComponent::~MainComponent()
{
    deviceManager.closeAudioDevice();
}

void MainComponent::paint(juce::Graphics& g)
{
    g.fillAll(juce::Colours::black);
    g.setColour(juce::Colours::white);

    g.setFont(22.0f);
    g.drawText("SignalForge",
               0, 20, getWidth(), 40,
               juce::Justification::centred);

    g.setFont(14.0f);
    g.drawText("JUCE app is running on Linux. Next: Audio callback + XR18 routing + recording.",
               20, 90, getWidth() - 40, 30,
               juce::Justification::centredLeft);

    auto dev = deviceManager.getCurrentAudioDevice();
    g.drawText(dev != nullptr ? ("Audio Device: " + dev->getName()) : "Audio Device: (none)",
               20, 140, getWidth() - 40, 24,
               juce::Justification::centredLeft);
}

void MainComponent::resized()
{
}
