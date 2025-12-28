#include "DiskWriter.h"
#include <iostream>

// The DiskWriter will read audio from this many samples at a time from the FIFO
static constexpr int DISK_WRITE_BUFFER_SIZE = 1024;

DiskWriter::DiskWriter(LockFreeAudioFIFO<float>* fifo)
    : audioFIFO(fifo)
{
}

DiskWriter::~DiskWriter()
{
    stopRecording();
}

void DiskWriter::pushNextBufferToFIFO (const float* const* inputChannels, int numSamples)
{
    if (isRecording.load(std::memory_order_acquire) && audioFIFO != nullptr)
    {
        // Interleave the channels before pushing to the FIFO
        std::vector<float> interleavedBuffer (numSamples * numChannels);
        for (int sample = 0; sample < numSamples; ++sample)
        {
            for (int channel = 0; channel < numChannels; ++channel)
            {
                interleavedBuffer[sample * numChannels + channel] = inputChannels[channel][sample];
            }
        }

        int samplesWritten = audioFIFO->write(interleavedBuffer.data(), (int)interleavedBuffer.size());

        // If samples were written, notify the disk thread to wake up and write
        if (samplesWritten > 0)
            condition.notify_one();
    }
}

void DiskWriter::startRecording(const juce::File& file, double sr, int channels, int bitD)
{
    // Ensure any previous recording is stopped and thread is joined
    stopRecording();

    // Clear the FIFO before starting a new recording to avoid old data
    if (audioFIFO != nullptr)
        audioFIFO->clear();

    // Reset state for new recording
    outputFile = file;
    sampleRate = sr;
    numChannels = channels;
    bitDepth = 32; // Always 32-bit float for now, as floats are pushed to FIFO
    shouldExit.store(false, std::memory_order_relaxed);
    isRecording.store(true, std::memory_order_release); // Use memory_order_release

    juce::WavAudioFormat wavFormat;
    juce::AudioFormatWriter::Options options = juce::AudioFormatWriter::Options()
                                                    .withSampleRate (sampleRate)
                                                    .withNumChannels ((unsigned int)numChannels)
                                                    .withBitsPerSample (bitDepth);

    std::unique_ptr<juce::FileOutputStream> fileOutputStream = std::make_unique<juce::FileOutputStream>(outputFile);
    if (! fileOutputStream->openedOk())
    {
        std::cerr << "DiskWriter: Failed to open output stream for file: " << outputFile.getFullPathName() << std::endl;
        isRecording.store(false, std::memory_order_relaxed);
        return;
    }

    std::unique_ptr<juce::OutputStream> outputStream = std::move(fileOutputStream);
    wavWriter = wavFormat.createWriterFor(outputStream, options);

    if (wavWriter == nullptr)
    {
        std::cerr << "DiskWriter: Failed to create WAV writer for file: " << outputFile.getFullPathName() << std::endl;
        isRecording.store(false, std::memory_order_relaxed);
        return;
    }

    // Start the disk thread
    diskThread = std::thread([this] { run(); });
}

void DiskWriter::stopRecording()
{
    // If not currently recording, do nothing.
    // The memory_order_acq_rel ensures proper synchronization.
    if (!isRecording.exchange(false, std::memory_order_acq_rel))
    {
        // Even if not actively recording, if the disk thread was started,
        // it needs to be signaled to exit and joined to prevent resource leaks.
        if (diskThread.joinable())
        {
            shouldExit.store(true, std::memory_order_release); // Ensure the thread knows to exit
            condition.notify_one(); // Wake it up if it's waiting
            diskThread.join(); // Wait for it to finish
            std::cout << "DiskWriter: Disk thread joined (non-recording stop)." << std::endl;
        }
        return; // Already stopped or not recording, so nothing more to do.
    }

    // Signal the thread to stop recording and exit gracefully
    shouldExit.store(true, std::memory_order_release);    // Signal the disk thread to exit
    condition.notify_one(); // Wake up the disk thread if it's waiting

    if (diskThread.joinable())
    {
        diskThread.join(); // Wait for the disk thread to finish
        std::cout << "DiskWriter: Disk thread joined." << std::endl;
    }

    if (wavWriter != nullptr)
    {
        wavWriter->flush(); // Ensure all buffered data is written
        wavWriter.reset();  // Closes the file
        std::cout << "DiskWriter: Recording stopped and file closed: " << outputFile.getFullPathName() << std::endl;
    }
    outputFile = juce::File(); // Clear output file
}

void DiskWriter::run()
{
    std::cout << "DiskWriter: Disk thread started." << std::endl;

    // Allocate a temporary buffer for reading from FIFO. This buffer will hold interleaved float data.
    std::vector<float> readBufferData(DISK_WRITE_BUFFER_SIZE);
    // This AudioBuffer will be used for writing to the WAV file (planar data).
    juce::AudioBuffer<float> writeBuffer(numChannels, DISK_WRITE_BUFFER_SIZE / numChannels);

    while (true)
    {
        int samplesRead = 0;
        if (audioFIFO != nullptr)
            samplesRead = audioFIFO->read(readBufferData.data(), (int)readBufferData.size());

        if (samplesRead > 0)
        {
            if (wavWriter != nullptr && numChannels > 0)
            {
                int numFrames = samplesRead / numChannels;

                // Ensure the writeBuffer can hold the data
                if (writeBuffer.getNumChannels() != numChannels || writeBuffer.getNumSamples() < numFrames)
                    writeBuffer.setSize(numChannels, numFrames, false, false, true);

                // De-interleave the data from readBufferData into writeBuffer
                for (int ch = 0; ch < numChannels; ++ch)
                {
                    float* channelData = writeBuffer.getWritePointer(ch);
                    for (int i = 0; i < numFrames; ++i)
                    {
                        channelData[i] = readBufferData[i * numChannels + ch];
                    }
                }
                wavWriter->writeFromAudioSampleBuffer(writeBuffer, 0, numFrames);
            }
        }
        else // No samples available
        {
            if (shouldExit.load(std::memory_order_acquire))
            {
                // If we should exit and FIFO is empty, break loop
                if (audioFIFO == nullptr || audioFIFO->getNumAvailableSamples() == 0)
                    break;
            }

            // Wait on condition variable for more data or exit signal
            std::unique_lock<std::mutex> lock(mutex);
            condition.wait(lock, [this] {
                return shouldExit.load(std::memory_order_acquire) ||
                       (audioFIFO != nullptr && audioFIFO->getNumAvailableSamples() > 0);
            });
        }
    }
    std::cout << "DiskWriter: Disk thread exiting." << std::endl;
}