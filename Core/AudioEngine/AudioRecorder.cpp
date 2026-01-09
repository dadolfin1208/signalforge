#include "AudioRecorder.h"

AudioRecorder::AudioRecorder()
{
}

AudioRecorder::~AudioRecorder()
{
    stopRecording();
}

void AudioRecorder::audioDeviceIOCallbackWithContext(const float* const* inputChannelData,
                                                    int numInputChannels,
                                                    float* const* outputChannelData,
                                                    int numOutputChannels,
                                                    int numSamples,
                                                    const juce::AudioIODeviceCallbackContext& context)
{
    juce::ignoreUnused(context);
    
    // Clear output buffers
    for (int i = 0; i < numOutputChannels; ++i)
        if (outputChannelData[i] != nullptr)
            juce::FloatVectorOperations::clear(outputChannelData[i], numSamples);

    // Record input if recording is active
    if (recording.load() && numInputChannels > 0)
    {
        recordBuffer.setSize(numInputChannels, numSamples, false, false, true);
        
        for (int channel = 0; channel < numInputChannels; ++channel)
        {
            if (inputChannelData[channel] != nullptr)
            {
                recordBuffer.copyFrom(channel, 0, inputChannelData[channel], numSamples);
            }
        }

        // Write to file
        const juce::ScopedLock sl(writerLock);
        if (writer != nullptr)
        {
            writer->writeFromAudioSampleBuffer(recordBuffer, 0, numSamples);
        }
    }

    // Monitor input to output if enabled
    if (monitoringEnabled && numInputChannels > 0 && numOutputChannels > 0)
    {
        for (int channel = 0; channel < juce::jmin(numInputChannels, numOutputChannels); ++channel)
        {
            if (inputChannelData[channel] != nullptr && outputChannelData[channel] != nullptr)
            {
                juce::FloatVectorOperations::copy(outputChannelData[channel], 
                                                 inputChannelData[channel], numSamples);
            }
        }
    }
}

void AudioRecorder::audioDeviceAboutToStart(juce::AudioIODevice* device)
{
    juce::ignoreUnused(device);
}

void AudioRecorder::audioDeviceStopped()
{
    stopRecording();
}

void AudioRecorder::startRecording(const juce::File& file)
{
    stopRecording();

    if (!file.getParentDirectory().exists())
        file.getParentDirectory().createDirectory();

    if (file.exists())
        file.deleteFile();

    juce::WavAudioFormat wavFormat;
    auto fileStream = std::make_unique<juce::FileOutputStream>(file);

    if (fileStream->openedOk())
    {
        const juce::ScopedLock sl(writerLock);
        writer.reset(wavFormat.createWriterFor(fileStream.release(), 44100.0, 2, 16, {}, 0));
        
        if (writer != nullptr)
        {
            recording = true;
            juce::Logger::writeToLog("Started recording to: " + file.getFullPathName());
        }
    }
}

void AudioRecorder::stopRecording()
{
    if (recording.load())
    {
        recording = false;
        
        const juce::ScopedLock sl(writerLock);
        writer.reset();
        
        juce::Logger::writeToLog("Recording stopped");
    }
}
