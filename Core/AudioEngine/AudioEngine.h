#pragma once

#include <JuceHeader.h>
#include "AudioEngine/Meter.h"
#include "AudioEngine/LockFreeAudioFIFO.h" // Include the FIFO header
#include "Recording/AudioRecorder.h"

class AudioGraph;

class AudioEngine final : public juce::AudioSource
{
public:
    AudioEngine();
    ~AudioEngine() override;

    // juce::AudioSource methods
    void prepareToPlay(int samplesPerBlockExpected, double sampleRate) override;
    void releaseResources() override;
    void getNextAudioBlock(const juce::AudioSourceChannelInfo& bufferToFill) override;

    juce::AudioDeviceManager& getDeviceManager() { return deviceManager; }
    Meter& getMeter() { return *meter; }

    void startRecording(const juce::File& file);
    void stopRecording();
    bool isRecording() const;

    // Getters for UI display
    double getSampleRate() const { return currentSampleRate; }
    int getBufferSize() const;
    juce::String getDeviceName() const;
    double getCpuUsage() const { return deviceManager.getCpuUsage(); }
    int getActiveInputChannels() const;
    int getActiveOutputChannels() const;



private:
    juce::AudioDeviceManager deviceManager;

    // Placeholder for AudioGraph
    std::unique_ptr<AudioGraph> audioGraph;
    std::unique_ptr<Meter> meter;


    std::unique_ptr<AudioRecorder> audioRecorder;

    double currentSampleRate = 0.0;
    int currentNumChannels = 0;




    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (AudioEngine)

};