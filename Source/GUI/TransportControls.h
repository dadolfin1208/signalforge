#pragma once
#include <JuceHeader.h>
#include <functional>

class TransportControls : public juce::Component
{
public:
    TransportControls();
    ~TransportControls() override;

    void paint(juce::Graphics& g) override;
    void resized() override;

    // Callbacks
    std::function<void()> onPlayClicked;
    std::function<void()> onStopClicked;
    std::function<void()> onRecordClicked;

private:
    std::unique_ptr<juce::TextButton> playButton;
    std::unique_ptr<juce::TextButton> stopButton;
    std::unique_ptr<juce::TextButton> recordButton;
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(TransportControls)
};
