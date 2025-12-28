#pragma once

#include <JuceHeader.h>
#include <atomic> // Include for std::atomic

class AudioRecorder
{
public:
    AudioRecorder(double sampleRate, int numChannels);
    ~AudioRecorder();

    void startRecording(const juce::File& fileToRecordTo);
    void stopRecording();
    void processBlock(const juce::AudioBuffer<float>& buffer, int numSamples);
    bool isRecording() const;

private:
    std::unique_ptr<juce::AudioFormatWriter::ThreadedWriter> threadedWriter;
    double sampleRate = 0.0;
    int numChannels = 0;
    juce::CriticalSection writerLock;
    
    // For managing the file output stream
    std::unique_ptr<juce::FileOutputStream> fileStream;
    juce::TimeSliceThread backgroundThread { "Audio Recorder Thread" };

    std::atomic<bool> isRecordingFlag { false }; // New member

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(AudioRecorder)
};
