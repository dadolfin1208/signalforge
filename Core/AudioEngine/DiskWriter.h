#pragma once

#include <JuceHeader.h>
#include <thread>
#include <atomic>
#include <condition_variable>
#include <mutex>

#include "LockFreeAudioFIFO.h" // Assuming this is in the same directory

class DiskWriter
{
public:
    DiskWriter(LockFreeAudioFIFO<float>* fifo);
    ~DiskWriter(); // Re-adding the destructor

    void startRecording(const juce::File& file, double sr, int channels, int bitDepth);
    void stopRecording();

    bool isCurrentlyRecording() const { return isRecording.load(std::memory_order_acquire); }

    void pushNextBufferToFIFO (const float* const* inputChannels, int numSamples);

private:
    void run();

    LockFreeAudioFIFO<float>* audioFIFO;

    std::thread diskThread;
    std::atomic<bool> shouldExit { false };
    std::atomic<bool> isRecording { false };

    std::condition_variable condition;
    std::mutex mutex; // Used with condition_variable

    std::unique_ptr<juce::AudioFormatWriter> wavWriter;
    juce::File outputFile;

    double sampleRate { 0.0 };
    int numChannels { 0 };
    int bitDepth { 0 };

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (DiskWriter)
};