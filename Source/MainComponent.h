#pragma once

#include <JuceHeader.h>
#include "AudioEngine/AudioEngine.h"

// Forward declarations
class SimpleDAW;

class MainComponent final : public juce::Component,
                            public juce::Timer
{
public:
    MainComponent();
    ~MainComponent() override;

    void paint(juce::Graphics& g) override;
    void resized() override;
    void timerCallback() override;

private:
    // API callbacks
    void handleAuthStateChanged(bool authenticated);
    void handleProcessingComplete(const String& type, var result);
    
    AudioEngine audioEngine;
    
    // Main DAW Interface
    std::unique_ptr<SimpleDAW> signalForgeDAW;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(MainComponent)
};