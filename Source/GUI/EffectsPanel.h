#pragma once
#include <JuceHeader.h>

class EffectsProcessor;

class EffectsPanel : public juce::Component
{
public:
    EffectsPanel();
    ~EffectsPanel() override;

    void paint(juce::Graphics& g) override;
    void resized() override;

    void setEffectsProcessor(EffectsProcessor* processor);

private:
    EffectsProcessor* effectsProcessor = nullptr;

    // EQ controls
    juce::Label eqLabel;
    juce::ToggleButton eqEnabledButton;
    juce::Slider lowGainSlider, midGainSlider, highGainSlider;
    juce::Label lowLabel, midLabel, highLabel;

    // Compressor controls
    juce::Label compLabel;
    juce::ToggleButton compEnabledButton;
    juce::Slider thresholdSlider, ratioSlider;
    juce::Label thresholdLabel, ratioLabel;

    // Reverb controls
    juce::Label reverbLabel;
    juce::ToggleButton reverbEnabledButton;
    juce::Slider roomSizeSlider, wetLevelSlider;
    juce::Label roomSizeLabel, wetLevelLabel;

    void setupSlider(juce::Slider& slider, juce::Label& label, const juce::String& text,
                     double min, double max, double defaultValue, const juce::String& suffix = "");

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(EffectsPanel)
};
