#include "AudioEngine.h"
#include "Meter.h" // Include Meter header
#include "Utils/Logger.h" // Include the Logger header

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
        bufferToFill.clearActiveBufferRegion(); // Simply clear the buffer
    }
};

AudioEngine::AudioEngine()
    : audioGraph(std::make_unique<AudioGraph>()),
      meter(std::make_unique<Meter>(static_cast<juce::AudioSource*>(audioGraph.get())))

{
}

AudioEngine::~AudioEngine()
{
    meter->releaseResources();
}

void AudioEngine::startRecording(const juce::File& file)
{
    if (audioRecorder != nullptr)
    {
        audioRecorder->startRecording(file);
    }
    else
    {
        juce::AlertWindow::showMessageBoxAsync(juce::AlertWindow::WarningIcon,
                                              "Recording Error",
                                              "Audio engine not prepared. Cannot start recording.");
    }
}

void AudioEngine::stopRecording()
{
    if (audioRecorder != nullptr)
    {
        audioRecorder->stopRecording();
    }
}

bool AudioEngine::isRecording() const
{
    return audioRecorder != nullptr && audioRecorder->isRecording();
}

int AudioEngine::getBufferSize() const
{
    if (auto* device = deviceManager.getCurrentAudioDevice())
        return device->getCurrentBufferSizeSamples();
    return 0;
}

juce::String AudioEngine::getDeviceName() const
{
    if (auto* device = deviceManager.getCurrentAudioDevice())
        return device->getName();
    return "No Audio Device Selected";
}

int AudioEngine::getActiveInputChannels() const
{
    if (auto* device = deviceManager.getCurrentAudioDevice())
        return device->getActiveInputChannels().countNumberOfSetBits();
    return 0;
}

int AudioEngine::getActiveOutputChannels() const
{
    if (auto* device = deviceManager.getCurrentAudioDevice())
        return device->getActiveOutputChannels().countNumberOfSetBits();
    return 0;
}

void AudioEngine::getNextAudioBlock(const juce::AudioSourceChannelInfo& bufferToFill)
{
    meter->getNextAudioBlock(bufferToFill);

    if (audioRecorder != nullptr && audioRecorder->isRecording())
    {
        audioRecorder->processBlock(*bufferToFill.buffer, bufferToFill.numSamples);
    }
}

void AudioEngine::prepareToPlay(int samplesPerBlockExpected, double sampleRate)
{
    currentSampleRate = sampleRate;

    auto* currentDevice = deviceManager.getCurrentAudioDevice();
    int inputChannels = 0;
    int outputChannels = 0;

    if (currentDevice != nullptr)
    {
        inputChannels = currentDevice->getActiveInputChannels().countNumberOfSetBits();
        outputChannels = currentDevice->getActiveOutputChannels().countNumberOfSetBits();
    }
    
    // Ensure we always have at least 2 channels for meter and recorder
    currentNumChannels = juce::jmax(inputChannels, outputChannels, 2); 
    
    meter->prepareToPlay(samplesPerBlockExpected, sampleRate);
    meter->setupInternalBuffers(samplesPerBlockExpected, sampleRate, currentNumChannels);

    audioRecorder = std::make_unique<AudioRecorder>(currentSampleRate, currentNumChannels);
}

void AudioEngine::releaseResources()
{
    meter->releaseResources();
}
