#pragma once

#include <JuceHeader.h>
#include "AudioEngine/Meter.h"

// Forward declarations
class MultiTrackMixer;
class Track;
class MidiManager;

class AudioEngine final : public juce::AudioSource
{
public:
    AudioEngine();
    ~AudioEngine() override;

    // juce::AudioSource methods
    void prepareToPlay(int samplesPerBlockExpected, double sampleRate) override;
    void releaseResources() override;
    void getNextAudioBlock(const juce::AudioSourceChannelInfo& bufferToFill) override;

    // Multi-track functionality
    int addTrack(const juce::String& name = "Track");
    void removeTrack(int trackIndex);
    Track* getTrack(int trackIndex);
    int getNumTracks() const;

    // Transport controls
    void play();
    void stop();
    void setPosition(double positionInSeconds);
    bool isPlaying() const;

    // MIDI functionality
    MidiManager& getMidiManager() { return *midiManager; }

    juce::AudioDeviceManager& getDeviceManager() { return deviceManager; }
    Meter& getMeter() { return *meter; }

private:
    juce::AudioDeviceManager deviceManager;
    juce::AudioSourcePlayer audioSourcePlayer;

    std::unique_ptr<MultiTrackMixer> mixer;
    std::unique_ptr<Meter> meter;
    std::unique_ptr<MidiManager> midiManager;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(AudioEngine)
};