#pragma once
#include <JuceHeader.h>

class Base44Client;

class SimpleDAW : public juce::Component,
                  public juce::Timer
{
public:
    SimpleDAW();
    ~SimpleDAW() override;

    void paint(juce::Graphics& g) override;
    void resized() override;
    void timerCallback() override;

private:
    // Simple UI elements
    std::unique_ptr<juce::TextButton> playButton;
    std::unique_ptr<juce::TextButton> stopButton;
    std::unique_ptr<juce::TextButton> recordButton;
    std::unique_ptr<juce::TextButton> aiMixButton;
    std::unique_ptr<juce::TextButton> aiMasterButton;
    std::unique_ptr<juce::TextButton> base44ToolsButton;
    
    std::unique_ptr<juce::Label> titleLabel;
    std::unique_ptr<juce::Label> statusLabel;
    std::unique_ptr<juce::TabbedComponent> tabbedComponent;
    std::unique_ptr<Base44Client> base44Client;
    
    bool isPlaying;
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(SimpleDAW)
};
