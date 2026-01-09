#pragma once
#include <JuceHeader.h>
#include "Track.h"

class MultiTrackMixer : public juce::AudioSource
{
public:
    MultiTrackMixer();
    ~MultiTrackMixer() override;

    // AudioSource interface
    void prepareToPlay(int samplesPerBlockExpected, double sampleRate) override;
    void releaseResources() override;
    void getNextAudioBlock(const juce::AudioSourceChannelInfo& bufferToFill) override;

    // Track management
    int addTrack(const juce::String& name = "Track");
    void removeTrack(int trackIndex);
    Track* getTrack(int trackIndex);
    int getNumTracks() const { return static_cast<int>(tracks.size()); }

    // Transport controls
    void play();
    void stop();
    void setPosition(double positionInSeconds);
    bool isPlaying() const { return playing; }

private:
    std::vector<std::unique_ptr<Track>> tracks;
    juce::AudioBuffer<float> mixBuffer;
    bool playing = false;
    
    int samplesPerBlock = 0;
    double currentSampleRate = 0.0;
};
