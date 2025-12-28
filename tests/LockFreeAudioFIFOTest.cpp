#include "../Core/AudioEngine/LockFreeAudioFIFO.h"
#include <iostream>
#include <vector>
#include <thread>
#include <numeric>
#include <cassert>

// Simple test function for LockFreeAudioFIFO
void runLockFreeAudioFIFOTest()
{
    const int bufferSize = 10; // Small buffer for easier testing
    LockFreeAudioFIFO<float> fifo(bufferSize);

    // --- Test 1: Write and Read a single sample ---
    float writeVal = 1.0f;
    float readVal = 0.0f;
    assert(fifo.write(&writeVal, 1) == 1);
    assert(fifo.getNumAvailableSamples() == 1);
    assert(fifo.read(&readVal, 1) == 1);
    assert(readVal == writeVal);
    assert(fifo.getNumAvailableSamples() == 0);
    std::cout << "Test 1 Passed: Single sample write/read.\n";

    // --- Test 2: Write until full, then read until empty ---
    std::vector<float> writeBuffer(bufferSize - 1); // FIFO can hold size-1 samples
    std::iota(writeBuffer.begin(), writeBuffer.end(), 0.0f); // Fill with 0.0, 1.0, ...

    int written = fifo.write(writeBuffer.data(), writeBuffer.size());
    assert(written == writeBuffer.size());
    assert(fifo.getNumAvailableSamples() == writeBuffer.size());
    std::cout << "Test 2a Passed: Wrote to full.\n";

    std::vector<float> readBuffer(bufferSize - 1);
    int read = fifo.read(readBuffer.data(), readBuffer.size());
    assert(read == readBuffer.size());
    assert(fifo.getNumAvailableSamples() == 0);
    for (size_t i = 0; i < writeBuffer.size(); ++i)
    {
        assert(readBuffer[i] == writeBuffer[i]);
    }
    std::cout << "Test 2b Passed: Read from empty, data integrity.\n";

    // --- Test 3: Concurrent write and read (simplified, not full stress test) ---
    const int largeBufferSize = 1024;
    LockFreeAudioFIFO<float> concurrentFifo(largeBufferSize);
    std::vector<float> producerData(largeBufferSize / 2);
    std::iota(producerData.begin(), producerData.end(), 100.0f);
    std::vector<float> consumerData(largeBufferSize / 2);

    std::thread producer([&]() {
        concurrentFifo.write(producerData.data(), producerData.size());
    });

    std::thread consumer([&]() {
        // Wait a bit to let producer write some data
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
        concurrentFifo.read(consumerData.data(), consumerData.size());
    });

    producer.join();
    consumer.join();

    assert(concurrentFifo.getNumAvailableSamples() == 0 || concurrentFifo.getNumAvailableSamples() == largeBufferSize/2); // Could be either, depending on timing

    // Verify some data if read was successful
    bool data_match = true;
    for(size_t i = 0; i < producerData.size(); ++i) {
        if (producerData[i] != consumerData[i]) {
            data_match = false;
            break;
        }
    }
    assert(data_match);
    std::cout << "Test 3 Passed: Basic concurrent write/read.\n";


    std::cout << "\nAll LockFreeAudioFIFO tests completed successfully!\n";
}

int main()
{
    runLockFreeAudioFIFOTest();
    return 0;
}
