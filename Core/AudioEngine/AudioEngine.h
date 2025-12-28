#pragma once

#include <JuceHeader.h>
#include "AudioEngine/Meter.h"

// Forward declaration of AudioGraph
class AudioGraph;

class AudioEngine final : public juce::AudioSource
{
public:
    AudioEngine();
    ~AudioEngine() override;

    // juce::AudioSource methods
    void prepareToPlay(int samplesPerBlockExpected, double sampleRate) override;
    void releaseResources() override;
    void getNextAudioBlock(const juce::AudioSourceChannelInfo& bufferToFill) override;

    juce::AudioDeviceManager& getDeviceManager() { return deviceManager; }
    Meter& getMeter() { return *meter; }

private:
    juce::AudioDeviceManager deviceManager;
    juce::AudioSourcePlayer audioSourcePlayer;

    // Placeholder for AudioGraph
    std::unique_ptr<AudioGraph> audioGraph;
    std::unique_ptr<Meter> meter;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(AudioEngine)
};