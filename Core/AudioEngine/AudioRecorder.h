#pragma once
#include <JuceHeader.h>

class AudioRecorder : public juce::AudioIODeviceCallback
{
public:
    AudioRecorder();
    ~AudioRecorder() override;

    // AudioIODeviceCallback interface
    void audioDeviceIOCallbackWithContext(const float* const* inputChannelData,
                                        int numInputChannels,
                                        float* const* outputChannelData,
                                        int numOutputChannels,
                                        int numSamples,
                                        const juce::AudioIODeviceCallbackContext& context) override;
    void audioDeviceAboutToStart(juce::AudioIODevice* device) override;
    void audioDeviceStopped() override;

    // Recording controls
    void startRecording(const juce::File& file);
    void stopRecording();
    bool isRecording() const { return recording; }

    // Monitoring
    void setMonitoringEnabled(bool enabled) { monitoringEnabled = enabled; }
    bool isMonitoringEnabled() const { return monitoringEnabled; }

private:
    std::unique_ptr<juce::AudioFormatWriter> writer;
    juce::CriticalSection writerLock;
    std::atomic<bool> recording { false };
    bool monitoringEnabled = true;
    
    juce::AudioBuffer<float> recordBuffer;
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(AudioRecorder)
};
