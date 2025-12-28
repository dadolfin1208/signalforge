#include "AudioEngine.h"
#include "Meter.h" // Include Meter header

// Placeholder for AudioGraph
class AudioGraph : public juce::AudioSource
{
public:
    void prepareToPlay(int samplesPerBlockExpected, double sampleRate) override
    {
        juce::ignoreUnused(samplesPerBlockExpected, sampleRate);
    }

    void releaseResources() override {}

    void getNextAudioBlock(const juce::AudioSourceChannelInfo& bufferToFill) override
    {
        // Simple pass-through: copy input to output for all channels
        for (int channel = 0; channel < bufferToFill.buffer->getNumChannels(); ++channel)
        {
            bufferToFill.buffer->copyFrom(channel, bufferToFill.startSample,
                                           *bufferToFill.buffer, channel, bufferToFill.startSample,
                                           bufferToFill.numSamples);
        }
    }
};

AudioEngine::AudioEngine()
    : audioGraph(std::make_unique<AudioGraph>()),
      meter(std::make_unique<Meter>(static_cast<juce::AudioSource*>(audioGraph.get()))) // Meter takes AudioGraph as input
{
    // Initialize with default devices.
    // This will be replaced by a device selector later.
    deviceManager.initialiseWithDefaultDevices(2, 2);

    // Set Meter as the source for the AudioSourcePlayer
    audioSourcePlayer.setSource(meter.get());

    // Register AudioSourcePlayer with the AudioDeviceManager
    deviceManager.addAudioCallback(&audioSourcePlayer);
}

AudioEngine::~AudioEngine()
{
    deviceManager.removeAudioCallback(&audioSourcePlayer);
    audioSourcePlayer.setSource(nullptr);
    meter->releaseResources();
    // audioGraph->releaseResources(); // Meter already released audioGraph resources
}

void AudioEngine::prepareToPlay(int samplesPerBlockExpected, double sampleRate)
{
    meter->prepareToPlay(samplesPerBlockExpected, sampleRate);
}

void AudioEngine::releaseResources()
{
    meter->releaseResources();
}

void AudioEngine::getNextAudioBlock(const juce::AudioSourceChannelInfo& bufferToFill)
{
    meter->getNextAudioBlock(bufferToFill);
}
