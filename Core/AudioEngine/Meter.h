#pragma once

#include <JuceHeader.h>
#include <atomic>
#include <vector>

class Meter final : public juce::AudioSource
{
public:
    Meter(juce::AudioSource* inputSource);
    ~Meter() override;

    // juce::AudioSource methods
    void prepareToPlay(int samplesPerBlockExpected, double sampleRate) override;
    void releaseResources() override;
    void getNextAudioBlock(const juce::AudioSourceChannelInfo& bufferToFill) override;

    float getAndResetPeak(int channelIndex);
    float getRMS(int channelIndex) const;

private:
    juce::AudioSource* input;
    std::vector<std::unique_ptr<std::atomic<float>>> peaks;
    std::vector<std::unique_ptr<std::atomic<float>>> rmsValues;
    std::vector<float> rmsSums;
    std::vector<int> rmsCounts;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(Meter)
};
