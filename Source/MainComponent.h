#pragma once

#include <juce_gui_basics/juce_gui_basics.h>
#include <juce_audio_devices/juce_audio_devices.h>

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
    juce::AudioDeviceManager deviceManager;

    juce::Label sampleRateLabel;
    juce::Label bufferSizeLabel;
    juce::Label deviceNameLabel;
    juce::Label cpuUsageLabel;
    juce::Label activeChannelsLabel;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(MainComponent)
};
