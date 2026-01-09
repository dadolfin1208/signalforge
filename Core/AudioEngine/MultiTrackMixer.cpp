#include "MultiTrackMixer.h"

MultiTrackMixer::MultiTrackMixer()
{
}

MultiTrackMixer::~MultiTrackMixer()
{
    releaseResources();
}

void MultiTrackMixer::prepareToPlay(int samplesPerBlockExpected, double sampleRate)
{
    samplesPerBlock = samplesPerBlockExpected;
    currentSampleRate = sampleRate;
    
    mixBuffer.setSize(2, samplesPerBlockExpected); // Stereo output
    
    for (auto& track : tracks)
    {
        track->prepareToPlay(samplesPerBlockExpected, sampleRate);
    }
}

void MultiTrackMixer::releaseResources()
{
    for (auto& track : tracks)
    {
        track->releaseResources();
    }
}

void MultiTrackMixer::getNextAudioBlock(const juce::AudioSourceChannelInfo& bufferToFill)
{
    bufferToFill.clearActiveBufferRegion();
    
    if (!playing || tracks.empty())
        return;

    // Check for solo tracks
    bool hasSolo = false;
    for (const auto& track : tracks)
    {
        if (track->isSolo())
        {
            hasSolo = true;
            break;
        }
    }

    // Mix all tracks
    for (auto& track : tracks)
    {
        // Skip muted tracks or non-solo tracks when solo is active
        if (track->isMuted() || (hasSolo && !track->isSolo()))
            continue;

        // Get track audio
        juce::AudioSourceChannelInfo trackInfo(&mixBuffer, 0, bufferToFill.numSamples);
        track->getNextAudioBlock(trackInfo);
        
        // Add to output buffer
        for (int channel = 0; channel < juce::jmin(bufferToFill.buffer->getNumChannels(), 
                                                   mixBuffer.getNumChannels()); ++channel)
        {
            bufferToFill.buffer->addFrom(channel, bufferToFill.startSample,
                                       mixBuffer, channel, 0, bufferToFill.numSamples);
        }
    }
}

int MultiTrackMixer::addTrack(const juce::String& name)
{
    auto track = std::make_unique<Track>(name);
    
    if (currentSampleRate > 0.0)
        track->prepareToPlay(samplesPerBlock, currentSampleRate);
    
    tracks.push_back(std::move(track));
    return static_cast<int>(tracks.size() - 1);
}

void MultiTrackMixer::removeTrack(int trackIndex)
{
    if (trackIndex >= 0 && trackIndex < static_cast<int>(tracks.size()))
    {
        tracks.erase(tracks.begin() + trackIndex);
    }
}

Track* MultiTrackMixer::getTrack(int trackIndex)
{
    if (trackIndex >= 0 && trackIndex < static_cast<int>(tracks.size()))
        return tracks[trackIndex].get();
    return nullptr;
}

void MultiTrackMixer::play()
{
    playing = true;
}

void MultiTrackMixer::stop()
{
    playing = false;
}

void MultiTrackMixer::setPosition(double positionInSeconds)
{
    for (auto& track : tracks)
    {
        track->setPosition(positionInSeconds);
    }
}
