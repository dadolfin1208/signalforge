#pragma once

#include <JuceHeader.h> // Ensure JuceHeader.h is used
#include "AudioEngine/AudioEngine.h"

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
    AudioEngine audioEngine; // Replaced deviceManager

    juce::Label sampleRateLabel;
    juce::Label bufferSizeLabel;
    juce::Label deviceNameLabel;
    juce::Label cpuUsageLabel;
    juce::Label activeChannelsLabel;

    juce::AudioDeviceSelectorComponent audioSettingsComponent; // Added

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(MainComponent)
};