#pragma once
#include <JuceHeader.h>

class PluginHost
{
public:
    PluginHost();
    ~PluginHost();

    void prepareToPlay(double sampleRate, int samplesPerBlock);
    void processBlock(juce::AudioBuffer<float>& buffer, juce::MidiBuffer& midiBuffer);
    void releaseResources();

    // Plugin management
    bool loadPlugin(const juce::PluginDescription& description);
    void unloadPlugin();
    bool hasPlugin() const { return plugin != nullptr; }

    // Plugin scanning
    void scanForPlugins();
    const juce::KnownPluginList& getPluginList() const { return knownPluginList; }

    // Plugin editor
    juce::AudioProcessorEditor* createEditor();
    void closeEditor();

    // Plugin state
    void getStateInformation(juce::MemoryBlock& destData);
    void setStateInformation(const void* data, int sizeInBytes);

private:
    std::unique_ptr<juce::AudioProcessor> plugin;
    juce::AudioPluginFormatManager formatManager;
    juce::KnownPluginList knownPluginList;
    std::unique_ptr<juce::PluginDirectoryScanner> scanner;
    
    double currentSampleRate = 44100.0;
    int currentBlockSize = 512;
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(PluginHost)
};
