#pragma once
#include <JuceHeader.h>

class TransportBarComponent : public juce::Component,
                             public juce::Button::Listener,
                             public juce::Timer
{
public:
    TransportBarComponent();
    ~TransportBarComponent() override;

    void paint(juce::Graphics& g) override;
    void resized() override;
    void buttonClicked(juce::Button* button) override;
    void timerCallback() override;

private:
    // Transport buttons
    std::unique_ptr<juce::TextButton> playButton;
    std::unique_ptr<juce::TextButton> stopButton;
    std::unique_ptr<juce::TextButton> recordButton;
    std::unique_ptr<juce::TextButton> rewindButton;
    std::unique_ptr<juce::TextButton> fastForwardButton;
    std::unique_ptr<juce::TextButton> loopButton;
    
    // Time display
    std::unique_ptr<juce::Label> timeDisplay;
    std::unique_ptr<juce::Label> tempoDisplay;
    
    // Tempo and time signature
    std::unique_ptr<juce::Slider> tempoSlider;
    std::unique_ptr<juce::ComboBox> timeSignature;
    
    // Master volume
    std::unique_ptr<juce::Slider> masterVolume;
    std::unique_ptr<juce::Label> masterVolumeLabel;
    
    // AI Processing indicators
    std::unique_ptr<juce::TextButton> aiMixingButton;
    std::unique_ptr<juce::TextButton> aiMasteringButton;
    
    // Transport state
    bool isPlaying;
    bool isRecording;
    bool isLooping;
    double currentTime;
    double bpm;
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(TransportBarComponent)
};
