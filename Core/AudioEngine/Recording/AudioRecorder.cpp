#include "AudioRecorder.h"

AudioRecorder::AudioRecorder(double sr, int nc) : sampleRate(sr), numChannels(nc)
{
    backgroundThread.startThread();
}

AudioRecorder::~AudioRecorder()
{
    stopRecording();
    backgroundThread.stopThread(500);
}

void AudioRecorder::startRecording(const juce::File& fileToRecordTo)
{
    stopRecording(); // Stop any existing recording first

    isRecordingFlag.store(true, std::memory_order_release); // Set flag to true

    // Choose WAV format, could be configurable
    auto wavFormat = std::make_unique<juce::WavAudioFormat>();
    
    fileStream = fileToRecordTo.createOutputStream();

    if (fileStream.get() != nullptr)
    {
        // Setup writer options
        juce::AudioFormatWriter::Options audioWriterOptions;
        audioWriterOptions = audioWriterOptions.withSampleRate (sampleRate)
                                                 .withNumChannels (numChannels)
                                                 .withBitsPerSample (16)
                                                 .withQualityOptionIndex (0);

        // Create the AudioFormatWriter, transferring ownership of the fileStream
        std::unique_ptr<juce::OutputStream> os = std::move(fileStream); // Create a temporary lvalue
        if (auto writer = wavFormat->createWriterFor (os, audioWriterOptions)) // Pass the lvalue reference
        {
            // Create the ThreadedWriter, transferring ownership of the audioWriter
            threadedWriter.reset (new juce::AudioFormatWriter::ThreadedWriter (writer.release(), backgroundThread, true));

            if (threadedWriter.get() != nullptr)
            {
                juce::Logger::writeToLog("Recording started to: " + fileToRecordTo.getFullPathName());
            }
            else
            {
                // If creation failed, clean up the stream.
                // fileStream is already null, writer.release() would have returned null if writer was null
                juce::Logger::writeToLog("ERROR: Failed to create threaded writer.");
            }
        }
        else
        {
            // If createWriterFor failed, fileStream might still hold the stream.
            // Reset it to ensure it's closed.
            fileStream.reset(); // ensure stream is closed if writer creation failed
            juce::AlertWindow::showMessageBoxAsync(juce::AlertWindow::WarningIcon,
                                                  "Recording Error",
                                                  "Could not create audio writer for file: " + fileToRecordTo.getFullPathName());
        }
    }
    else
    {
        juce::AlertWindow::showMessageBoxAsync(juce::AlertWindow::WarningIcon,
                                              "Recording Error",
                                              "Could not create output file: " + fileToRecordTo.getFullPathName());
    }
}

void AudioRecorder::stopRecording()
{
    // If not recording, do nothing.
    if (!isRecordingFlag.exchange(false, std::memory_order_acq_rel))
        return;

    threadedWriter.reset(); // This will stop the recording thread and close the file
    juce::Logger::writeToLog("Recording stopped.");
}

void AudioRecorder::processBlock(const juce::AudioBuffer<float>& buffer, int numSamples)
{
    if (isRecording())
    {
        threadedWriter->write(buffer.getArrayOfReadPointers(), numSamples);
    }
}

bool AudioRecorder::isRecording() const
{
    return isRecordingFlag.load(std::memory_order_acquire);
}
