#include "Meter.h"
#include <cmath> // For std::sqrt

Meter::Meter(juce::AudioSource* inputSource)
    : input(inputSource)
{
}

Meter::~Meter()
{
}

void Meter::prepareToPlay(int samplesPerBlockExpected, double sampleRate)
{
    input->prepareToPlay(samplesPerBlockExpected, sampleRate);

    int numChannels = 2; // Default to stereo, will adjust in getNextAudioBlock

    peaks.clear();
    rmsValues.clear();
    rmsSums.clear();
    rmsCounts.clear();

    for (int i = 0; i < numChannels; ++i)
    {
        peaks.push_back(std::make_unique<std::atomic<float>>(0.0f));
        rmsValues.push_back(std::make_unique<std::atomic<float>>(0.0f));
        rmsSums.push_back(0.0f);
        rmsCounts.push_back(0);
    }
}

void Meter::releaseResources()
{
    input->releaseResources();
}

void Meter::getNextAudioBlock(const juce::AudioSourceChannelInfo& bufferToFill)
{
    input->getNextAudioBlock(bufferToFill);

    int numChannels = bufferToFill.buffer->getNumChannels();
    int numSamples = bufferToFill.numSamples;

    if (numChannels > (int)peaks.size())
    {
        size_t oldSize = peaks.size();
        peaks.reserve(numChannels);
        rmsValues.reserve(numChannels);
        rmsSums.reserve(numChannels);
        rmsCounts.reserve(numChannels);

        for (size_t i = oldSize; i < (size_t)numChannels; ++i)
        {
            peaks.push_back(std::make_unique<std::atomic<float>>(0.0f));
            rmsValues.push_back(std::make_unique<std::atomic<float>>(0.0f));
            rmsSums.push_back(0.0f);
            rmsCounts.push_back(0);
        }
    }

    for (int channel = 0; channel < numChannels; ++channel)
    {
        const float* channelData = bufferToFill.buffer->getReadPointer(channel);
        float currentPeak = 0.0f;
        float currentRMSSum = 0.0f;

        for (int sample = 0; sample < numSamples; ++sample)
        {
            float absValue = std::abs(channelData[sample]); // Use std::abs
            if (absValue > currentPeak)
                currentPeak = absValue;
            currentRMSSum += (channelData[sample] * channelData[sample]);
        }

        // Update peaks (atomic)
        float oldPeak = peaks[channel]->load();
        while (currentPeak > oldPeak && !peaks[channel]->compare_exchange_weak(oldPeak, currentPeak))
        {
            oldPeak = peaks[channel]->load();
        }

        // Accumulate RMS sums for averaging over a longer period if needed
        rmsSums[channel] += currentRMSSum;
        rmsCounts[channel] += numSamples;

        // For simplicity, calculate RMS for this block and store (atomic)
        float rms = juce::jmin(1.0f, juce::jmax(0.0f, std::sqrt(currentRMSSum / (float)numSamples))); // Use std::sqrt
        rmsValues[channel]->store(rms);
    }
}

float Meter::getAndResetPeak(int channelIndex)
{
    if ((size_t)channelIndex < peaks.size())
    {
        return peaks[channelIndex]->exchange(0.0f); // Atomically get and reset
    }
    return 0.0f;
}

float Meter::getRMS(int channelIndex) const
{
    if ((size_t)channelIndex < rmsValues.size())
    {
        return rmsValues[channelIndex]->load();
    }
    return 0.0f;
}
