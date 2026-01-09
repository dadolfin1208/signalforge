#pragma once
#include <JuceHeader.h>

class EffectsProcessor
{
public:
    EffectsProcessor();
    ~EffectsProcessor();

    void prepareToPlay(double sampleRate, int samplesPerBlock, int numChannels);
    void processBlock(juce::AudioBuffer<float>& buffer);
    void reset();

    // EQ controls
    void setLowGain(float gainDb);
    void setMidGain(float gainDb);
    void setHighGain(float gainDb);

    // Compressor controls
    void setCompressorThreshold(float thresholdDb);
    void setCompressorRatio(float ratio);
    void setCompressorAttack(float attackMs);
    void setCompressorRelease(float releaseMs);

    // Reverb controls
    void setReverbRoomSize(float size);
    void setReverbDamping(float damping);
    void setReverbWetLevel(float wetLevel);
    void setReverbDryLevel(float dryLevel);

    // Chorus controls
    void setChorusRate(float rateHz);
    void setChorusDepth(float depth);
    void setChorusCentreDelay(float delayMs);
    void setChorusFeedback(float feedback);
    void setChorusMix(float mix);

    // Delay controls
    void setDelayTime(float timeMs);
    void setDelayFeedback(float feedback);
    void setDelayMix(float mix);

    // Enable/disable effects
    void setEQEnabled(bool enabled) { eqEnabled = enabled; }
    void setCompressorEnabled(bool enabled) { compressorEnabled = enabled; }
    void setReverbEnabled(bool enabled) { reverbEnabled = enabled; }
    void setChorusEnabled(bool enabled) { chorusEnabled = enabled; }
    void setDelayEnabled(bool enabled) { delayEnabled = enabled; }

private:
    // EQ
    juce::dsp::ProcessorDuplicator<juce::dsp::IIR::Filter<float>, juce::dsp::IIR::Coefficients<float>> lowShelfFilter;
    juce::dsp::ProcessorDuplicator<juce::dsp::IIR::Filter<float>, juce::dsp::IIR::Coefficients<float>> midPeakFilter;
    juce::dsp::ProcessorDuplicator<juce::dsp::IIR::Filter<float>, juce::dsp::IIR::Coefficients<float>> highShelfFilter;

    // Compressor
    juce::dsp::Compressor<float> compressor;

    // Reverb
    juce::dsp::Reverb reverb;

    // Chorus
    juce::dsp::Chorus<float> chorus;

    // Delay
    juce::dsp::DelayLine<float, juce::dsp::DelayLineInterpolationTypes::Linear> delayLine;
    float delayTime = 250.0f;
    float delayFeedback = 0.3f;
    float delayMix = 0.3f;

    // Processing chain
    juce::dsp::ProcessorChain<
        decltype(lowShelfFilter),
        decltype(midPeakFilter),
        decltype(highShelfFilter),
        decltype(compressor),
        decltype(chorus),
        decltype(reverb)
    > processorChain;

    bool eqEnabled = false;
    bool compressorEnabled = false;
    bool reverbEnabled = false;
    bool chorusEnabled = false;
    bool delayEnabled = false;

    double currentSampleRate = 44100.0;
};
