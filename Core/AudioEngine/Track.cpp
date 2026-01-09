#include "Track.h"
#include "EffectsProcessor.h"
#include "PluginHost.h"

Track::Track(const juce::String& name) 
    : trackName(name), 
      effectsProcessor(std::make_unique<EffectsProcessor>()),
      pluginHost(std::make_unique<PluginHost>())
{
}

Track::~Track()
{
    releaseResources();
}

void Track::prepareToPlay(int samplesPerBlockExpected, double sampleRate)
{
    transportSource.prepareToPlay(samplesPerBlockExpected, sampleRate);
    effectsProcessor->prepareToPlay(sampleRate, samplesPerBlockExpected, 2); // Stereo
    pluginHost->prepareToPlay(sampleRate, samplesPerBlockExpected);
}

void Track::releaseResources()
{
    transportSource.releaseResources();
    effectsProcessor->reset();
    pluginHost->releaseResources();
}

void Track::getNextAudioBlock(const juce::AudioSourceChannelInfo& bufferToFill)
{
    if (muted)
    {
        bufferToFill.clearActiveBufferRegion();
        return;
    }

    transportSource.getNextAudioBlock(bufferToFill);
    
    // Apply built-in effects
    effectsProcessor->processBlock(*bufferToFill.buffer);
    
    // Process through plugin
    midiBuffer.clear();
    pluginHost->processBlock(*bufferToFill.buffer, midiBuffer);
    
    // Apply gain
    if (gain != 1.0f)
    {
        for (int channel = 0; channel < bufferToFill.buffer->getNumChannels(); ++channel)
        {
            bufferToFill.buffer->applyGain(channel, bufferToFill.startSample, 
                                         bufferToFill.numSamples, gain);
        }
    }
}

void Track::loadAudioFile(const juce::File& file)
{
    juce::AudioFormatManager formatManager;
    formatManager.registerBasicFormats();
    
    auto reader = formatManager.createReaderFor(file);
    if (reader != nullptr)
    {
        readerSource = std::make_unique<juce::AudioFormatReaderSource>(reader, true);
        transportSource.setSource(readerSource.get(), 0, nullptr, reader->sampleRate);
    }
}

void Track::setGain(float newGain)
{
    gain = juce::jlimit(0.0f, 2.0f, newGain);
}

void Track::setMuted(bool shouldMute)
{
    muted = shouldMute;
}

void Track::setSolo(bool shouldSolo)
{
    solo = shouldSolo;
}

void Track::setPosition(double positionInSeconds)
{
    transportSource.setPosition(positionInSeconds);
}

double Track::getLength() const
{
    if (readerSource && readerSource->getAudioFormatReader())
        return readerSource->getAudioFormatReader()->lengthInSamples / 
               readerSource->getAudioFormatReader()->sampleRate;
    return 0.0;
}
