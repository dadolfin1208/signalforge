#pragma once

#include <vector>
#include <atomic>
#include <cassert>

template <typename T>
class LockFreeAudioFIFO
{
public:
    LockFreeAudioFIFO(int size) :
        buffer(size),
        bufferSize(size),
        writePointer(0),
        readPointer(0)
    {
        assert(size > 0);
    }

    // Writes data to the FIFO from the audio thread
    int write(const T* data, int numSamples)
    {
        int samplesWritten = 0;
        int currentWritePointer = writePointer.load(std::memory_order_relaxed);
        int currentReadPointer = readPointer.load(std::memory_order_acquire);

        int freeSpace = (currentReadPointer - currentWritePointer - 1 + bufferSize) % bufferSize;

        if (freeSpace == 0)
            return 0; // FIFO is full

        samplesWritten = std::min(numSamples, freeSpace);

        for (int i = 0; i < samplesWritten; ++i)
        {
            buffer[currentWritePointer] = data[i];
            currentWritePointer = (currentWritePointer + 1) % bufferSize;
        }

        writePointer.store(currentWritePointer, std::memory_order_release);
        return samplesWritten;
    }

    // Reads data from the FIFO from the disk thread
    int read(T* data, int numSamples)
    {
        int samplesRead = 0;
        int currentWritePointer = writePointer.load(std::memory_order_acquire);
        int currentReadPointer = readPointer.load(std::memory_order_relaxed);

        int availableSamples = (currentWritePointer - currentReadPointer + bufferSize) % bufferSize;

        if (availableSamples == 0)
            return 0; // FIFO is empty

        samplesRead = std::min(numSamples, availableSamples);

        for (int i = 0; i < samplesRead; ++i)
        {
            data[i] = buffer[currentReadPointer];
            currentReadPointer = (currentReadPointer + 1) % bufferSize;
        }

        readPointer.store(currentReadPointer, std::memory_order_release);
        return samplesRead;
    }

    // Returns the number of samples currently available in the FIFO
    int getNumAvailableSamples() const
    {
        int currentWritePointer = writePointer.load(std::memory_order_acquire);
        int currentReadPointer = readPointer.load(std::memory_order_relaxed);
        return (currentWritePointer - currentReadPointer + bufferSize) % bufferSize;
    }

    // Returns the number of free slots in the FIFO
    int getFreeSpace() const
    {
        int currentWritePointer = writePointer.load(std::memory_order_relaxed);
        int currentReadPointer = readPointer.load(std::memory_order_acquire);
        return (currentReadPointer - currentWritePointer - 1 + bufferSize) % bufferSize;
    }

    // Resets the FIFO to an empty state
    void clear()
    {
        writePointer.store(0, std::memory_order_release);
        readPointer.store(0, std::memory_order_release);
    }

private:
    std::vector<T> buffer;
    const int bufferSize;
    std::atomic<int> writePointer;
    std::atomic<int> readPointer;

    // Disallow copy and assignment
    LockFreeAudioFIFO(const LockFreeAudioFIFO&) = delete;
    LockFreeAudioFIFO& operator=(const LockFreeAudioFIFO&) = delete;
};
