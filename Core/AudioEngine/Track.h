#pragma once
#include <JuceHeader.h>

class EffectsProcessor;
class PluginHost;

class Track : public juce::AudioSource
{
public:
    Track(const juce::String& name = "Track");
    ~Track() override;

    // AudioSource interface
    void prepareToPlay(int samplesPerBlockExpected, double sampleRate) override;
    void releaseResources() override;
    void getNextAudioBlock(const juce::AudioSourceChannelInfo& bufferToFill) override;

    // Track controls
    void loadAudioFile(const juce::File& file);
    void setGain(float gain);
    void setMuted(bool muted);
    void setSolo(bool solo);
    void setPosition(double positionInSeconds);
    
    // Effects and plugins
    EffectsProcessor& getEffectsProcessor() { return *effectsProcessor; }
    PluginHost& getPluginHost() { return *pluginHost; }
    
    // Getters
    const juce::String& getName() const { return trackName; }
    float getGain() const { return gain; }
    bool isMuted() const { return muted; }
    bool isSolo() const { return solo; }
    double getLength() const;

private:
    juce::String trackName;
    std::unique_ptr<juce::AudioFormatReaderSource> readerSource;
    juce::AudioTransportSource transportSource;
    std::unique_ptr<EffectsProcessor> effectsProcessor;
    std::unique_ptr<PluginHost> pluginHost;
    
    juce::MidiBuffer midiBuffer; // For plugin MIDI
    
    float gain = 1.0f;
    bool muted = false;
    bool solo = false;
};
