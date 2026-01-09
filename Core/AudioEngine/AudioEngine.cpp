#include "AudioEngine.h"
#include "Meter.h"
#include "MultiTrackMixer.h"
#include "MidiManager.h"

AudioEngine::AudioEngine()
    : mixer(std::make_unique<MultiTrackMixer>()),
      meter(std::make_unique<Meter>(mixer.get())),
      midiManager(std::make_unique<MidiManager>())
{
    // Initialize with default devices
    deviceManager.initialiseWithDefaultDevices(2, 2);

    // Set Meter as the source for the AudioSourcePlayer
    audioSourcePlayer.setSource(meter.get());

    // Register AudioSourcePlayer with the AudioDeviceManager
    deviceManager.addAudioCallback(&audioSourcePlayer);
    
    // Setup MIDI callback
    midiManager->onMidiReceived = [this](const juce::MidiMessage& message) {
        // Handle MIDI messages here
        // For now, just log them (already done in MidiManager)
        juce::ignoreUnused(message);
    };
}

AudioEngine::~AudioEngine()
{
    deviceManager.removeAudioCallback(&audioSourcePlayer);
    audioSourcePlayer.setSource(nullptr);
    meter->releaseResources();
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

// New multi-track methods
int AudioEngine::addTrack(const juce::String& name)
{
    return mixer->addTrack(name);
}

void AudioEngine::removeTrack(int trackIndex)
{
    mixer->removeTrack(trackIndex);
}

Track* AudioEngine::getTrack(int trackIndex)
{
    return mixer->getTrack(trackIndex);
}

int AudioEngine::getNumTracks() const
{
    return mixer->getNumTracks();
}

void AudioEngine::play()
{
    mixer->play();
}

void AudioEngine::stop()
{
    mixer->stop();
}

void AudioEngine::setPosition(double positionInSeconds)
{
    mixer->setPosition(positionInSeconds);
}

bool AudioEngine::isPlaying() const
{
    return mixer->isPlaying();
}
