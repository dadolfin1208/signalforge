#include "EffectsProcessor.h"

EffectsProcessor::EffectsProcessor()
{
    // Initialize reverb parameters
    juce::dsp::Reverb::Parameters reverbParams;
    reverbParams.roomSize = 0.5f;
    reverbParams.damping = 0.5f;
    reverbParams.wetLevel = 0.3f;
    reverbParams.dryLevel = 0.7f;
    reverb.setParameters(reverbParams);
}

EffectsProcessor::~EffectsProcessor()
{
}

void EffectsProcessor::prepareToPlay(double sampleRate, int samplesPerBlock, int numChannels)
{
    currentSampleRate = sampleRate;
    
    juce::dsp::ProcessSpec spec;
    spec.sampleRate = sampleRate;
    spec.maximumBlockSize = static_cast<juce::uint32>(samplesPerBlock);
    spec.numChannels = static_cast<juce::uint32>(numChannels);

    processorChain.prepare(spec);
    delayLine.prepare(spec);
    delayLine.setMaximumDelayInSamples(static_cast<int>(sampleRate * 2.0)); // 2 second max delay

    // Setup EQ filters
    setLowGain(0.0f);   // 0 dB (no change)
    setMidGain(0.0f);   // 0 dB (no change)
    setHighGain(0.0f);  // 0 dB (no change)

    // Setup compressor
    setCompressorThreshold(-12.0f);
    setCompressorRatio(4.0f);
    setCompressorAttack(10.0f);
    setCompressorRelease(100.0f);

    // Setup chorus
    setChorusRate(1.0f);
    setChorusDepth(0.25f);
    setChorusCentreDelay(7.0f);
    setChorusFeedback(0.0f);
    setChorusMix(0.5f);

    // Setup delay
    setDelayTime(250.0f);
    setDelayFeedback(0.3f);
    setDelayMix(0.3f);
}

void EffectsProcessor::processBlock(juce::AudioBuffer<float>& buffer)
{
    juce::dsp::AudioBlock<float> block(buffer);
    juce::dsp::ProcessContextReplacing<float> context(block);

    // Process individual effects based on enabled state
    if (eqEnabled)
    {
        processorChain.get<0>().process(context);  // Low shelf
        processorChain.get<1>().process(context);  // Mid peak
        processorChain.get<2>().process(context);  // High shelf
    }
    
    if (compressorEnabled)
    {
        processorChain.get<3>().process(context);  // Compressor
    }
    
    if (chorusEnabled)
    {
        processorChain.get<4>().process(context);  // Chorus
    }
    
    if (reverbEnabled)
    {
        processorChain.get<5>().process(context);  // Reverb
    }

    // Process delay separately (not in chain for feedback control)
    if (delayEnabled)
    {
        for (int channel = 0; channel < buffer.getNumChannels(); ++channel)
        {
            auto* channelData = buffer.getWritePointer(channel);
            
            for (int sample = 0; sample < buffer.getNumSamples(); ++sample)
            {
                auto input = channelData[sample];
                auto delayedSample = delayLine.popSample(channel);
                auto output = input + delayedSample * delayMix;
                
                delayLine.pushSample(channel, input + delayedSample * delayFeedback);
                channelData[sample] = output;
            }
        }
    }
}

void EffectsProcessor::reset()
{
    processorChain.reset();
}

void EffectsProcessor::setLowGain(float gainDb)
{
    auto& lowShelf = processorChain.get<0>();
    *lowShelf.state = *juce::dsp::IIR::Coefficients<float>::makeLowShelf(
        currentSampleRate, 200.0f, 0.7f, juce::Decibels::decibelsToGain(gainDb));
}

void EffectsProcessor::setMidGain(float gainDb)
{
    auto& midPeak = processorChain.get<1>();
    *midPeak.state = *juce::dsp::IIR::Coefficients<float>::makePeakFilter(
        currentSampleRate, 1000.0f, 0.7f, juce::Decibels::decibelsToGain(gainDb));
}

void EffectsProcessor::setHighGain(float gainDb)
{
    auto& highShelf = processorChain.get<2>();
    *highShelf.state = *juce::dsp::IIR::Coefficients<float>::makeHighShelf(
        currentSampleRate, 5000.0f, 0.7f, juce::Decibels::decibelsToGain(gainDb));
}

void EffectsProcessor::setCompressorThreshold(float thresholdDb)
{
    auto& comp = processorChain.get<3>();
    comp.setThreshold(thresholdDb);
}

void EffectsProcessor::setCompressorRatio(float ratio)
{
    auto& comp = processorChain.get<3>();
    comp.setRatio(ratio);
}

void EffectsProcessor::setCompressorAttack(float attackMs)
{
    auto& comp = processorChain.get<3>();
    comp.setAttack(attackMs);
}

void EffectsProcessor::setCompressorRelease(float releaseMs)
{
    auto& comp = processorChain.get<3>();
    comp.setRelease(releaseMs);
}

void EffectsProcessor::setReverbRoomSize(float size)
{
    auto& rev = processorChain.get<5>();
    auto params = rev.getParameters();
    params.roomSize = size;
    rev.setParameters(params);
}

void EffectsProcessor::setReverbDamping(float damping)
{
    auto& rev = processorChain.get<5>();
    auto params = rev.getParameters();
    params.damping = damping;
    rev.setParameters(params);
}

void EffectsProcessor::setReverbWetLevel(float wetLevel)
{
    auto& rev = processorChain.get<5>();
    auto params = rev.getParameters();
    params.wetLevel = wetLevel;
    rev.setParameters(params);
}

void EffectsProcessor::setReverbDryLevel(float dryLevel)
{
    auto& rev = processorChain.get<5>();
    auto params = rev.getParameters();
    params.dryLevel = dryLevel;
    rev.setParameters(params);
}

void EffectsProcessor::setChorusRate(float rateHz)
{
    auto& ch = processorChain.get<4>();
    ch.setRate(rateHz);
}

void EffectsProcessor::setChorusDepth(float depth)
{
    auto& ch = processorChain.get<4>();
    ch.setDepth(depth);
}

void EffectsProcessor::setChorusCentreDelay(float delayMs)
{
    auto& ch = processorChain.get<4>();
    ch.setCentreDelay(delayMs);
}

void EffectsProcessor::setChorusFeedback(float feedback)
{
    auto& ch = processorChain.get<4>();
    ch.setFeedback(feedback);
}

void EffectsProcessor::setChorusMix(float mix)
{
    auto& ch = processorChain.get<4>();
    ch.setMix(mix);
}

void EffectsProcessor::setDelayTime(float timeMs)
{
    delayTime = timeMs;
    delayLine.setDelay(timeMs * currentSampleRate / 1000.0f);
}

void EffectsProcessor::setDelayFeedback(float feedback)
{
    delayFeedback = juce::jlimit(0.0f, 0.95f, feedback);
}

void EffectsProcessor::setDelayMix(float mix)
{
    delayMix = juce::jlimit(0.0f, 1.0f, mix);
}
