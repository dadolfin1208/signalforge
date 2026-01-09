#include "EffectsPanel.h"
#include "AudioEngine/EffectsProcessor.h"

EffectsPanel::EffectsPanel()
{
    // EQ section
    eqLabel.setText("EQ", juce::dontSendNotification);
    eqLabel.setFont(juce::Font(16.0f, juce::Font::bold));
    addAndMakeVisible(eqLabel);

    eqEnabledButton.setButtonText("Enable EQ");
    addAndMakeVisible(eqEnabledButton);

    setupSlider(lowGainSlider, lowLabel, "Low", -12.0, 12.0, 0.0, " dB");
    setupSlider(midGainSlider, midLabel, "Mid", -12.0, 12.0, 0.0, " dB");
    setupSlider(highGainSlider, highLabel, "High", -12.0, 12.0, 0.0, " dB");

    // Compressor section
    compLabel.setText("Compressor", juce::dontSendNotification);
    compLabel.setFont(juce::Font(16.0f, juce::Font::bold));
    addAndMakeVisible(compLabel);

    compEnabledButton.setButtonText("Enable Comp");
    addAndMakeVisible(compEnabledButton);

    setupSlider(thresholdSlider, thresholdLabel, "Threshold", -40.0, 0.0, -12.0, " dB");
    setupSlider(ratioSlider, ratioLabel, "Ratio", 1.0, 20.0, 4.0, ":1");

    // Reverb section
    reverbLabel.setText("Reverb", juce::dontSendNotification);
    reverbLabel.setFont(juce::Font(16.0f, juce::Font::bold));
    addAndMakeVisible(reverbLabel);

    reverbEnabledButton.setButtonText("Enable Reverb");
    addAndMakeVisible(reverbEnabledButton);

    setupSlider(roomSizeSlider, roomSizeLabel, "Room Size", 0.0, 1.0, 0.5);
    setupSlider(wetLevelSlider, wetLevelLabel, "Wet Level", 0.0, 1.0, 0.3);

    // Setup callbacks
    eqEnabledButton.onClick = [this]() {
        if (effectsProcessor)
            effectsProcessor->setEQEnabled(eqEnabledButton.getToggleState());
    };

    compEnabledButton.onClick = [this]() {
        if (effectsProcessor)
            effectsProcessor->setCompressorEnabled(compEnabledButton.getToggleState());
    };

    reverbEnabledButton.onClick = [this]() {
        if (effectsProcessor)
            effectsProcessor->setReverbEnabled(reverbEnabledButton.getToggleState());
    };

    lowGainSlider.onValueChange = [this]() {
        if (effectsProcessor)
            effectsProcessor->setLowGain(static_cast<float>(lowGainSlider.getValue()));
    };

    midGainSlider.onValueChange = [this]() {
        if (effectsProcessor)
            effectsProcessor->setMidGain(static_cast<float>(midGainSlider.getValue()));
    };

    highGainSlider.onValueChange = [this]() {
        if (effectsProcessor)
            effectsProcessor->setHighGain(static_cast<float>(highGainSlider.getValue()));
    };

    thresholdSlider.onValueChange = [this]() {
        if (effectsProcessor)
            effectsProcessor->setCompressorThreshold(static_cast<float>(thresholdSlider.getValue()));
    };

    ratioSlider.onValueChange = [this]() {
        if (effectsProcessor)
            effectsProcessor->setCompressorRatio(static_cast<float>(ratioSlider.getValue()));
    };

    roomSizeSlider.onValueChange = [this]() {
        if (effectsProcessor)
            effectsProcessor->setReverbRoomSize(static_cast<float>(roomSizeSlider.getValue()));
    };

    wetLevelSlider.onValueChange = [this]() {
        if (effectsProcessor)
            effectsProcessor->setReverbWetLevel(static_cast<float>(wetLevelSlider.getValue()));
    };

    setSize(300, 400);
}

EffectsPanel::~EffectsPanel()
{
}

void EffectsPanel::paint(juce::Graphics& g)
{
    g.fillAll(juce::Colours::black);
    g.setColour(juce::Colours::grey);
    g.drawRect(getLocalBounds(), 1);
}

void EffectsPanel::resized()
{
    auto bounds = getLocalBounds().reduced(10);
    int rowHeight = 25;
    int sectionSpacing = 10;

    // EQ section
    eqLabel.setBounds(bounds.removeFromTop(rowHeight));
    eqEnabledButton.setBounds(bounds.removeFromTop(rowHeight));
    lowLabel.setBounds(bounds.removeFromTop(15));
    lowGainSlider.setBounds(bounds.removeFromTop(rowHeight));
    midLabel.setBounds(bounds.removeFromTop(15));
    midGainSlider.setBounds(bounds.removeFromTop(rowHeight));
    highLabel.setBounds(bounds.removeFromTop(15));
    highGainSlider.setBounds(bounds.removeFromTop(rowHeight));
    bounds.removeFromTop(sectionSpacing);

    // Compressor section
    compLabel.setBounds(bounds.removeFromTop(rowHeight));
    compEnabledButton.setBounds(bounds.removeFromTop(rowHeight));
    thresholdLabel.setBounds(bounds.removeFromTop(15));
    thresholdSlider.setBounds(bounds.removeFromTop(rowHeight));
    ratioLabel.setBounds(bounds.removeFromTop(15));
    ratioSlider.setBounds(bounds.removeFromTop(rowHeight));
    bounds.removeFromTop(sectionSpacing);

    // Reverb section
    reverbLabel.setBounds(bounds.removeFromTop(rowHeight));
    reverbEnabledButton.setBounds(bounds.removeFromTop(rowHeight));
    roomSizeLabel.setBounds(bounds.removeFromTop(15));
    roomSizeSlider.setBounds(bounds.removeFromTop(rowHeight));
    wetLevelLabel.setBounds(bounds.removeFromTop(15));
    wetLevelSlider.setBounds(bounds.removeFromTop(rowHeight));
}

void EffectsPanel::setEffectsProcessor(EffectsProcessor* processor)
{
    effectsProcessor = processor;
}

void EffectsPanel::setupSlider(juce::Slider& slider, juce::Label& label, const juce::String& text,
                               double min, double max, double defaultValue, const juce::String& suffix)
{
    slider.setRange(min, max);
    slider.setValue(defaultValue);
    slider.setSliderStyle(juce::Slider::LinearHorizontal);
    slider.setTextBoxStyle(juce::Slider::TextBoxRight, false, 60, 20);
    slider.setTextValueSuffix(suffix);
    addAndMakeVisible(slider);

    label.setText(text, juce::dontSendNotification);
    label.setFont(juce::Font(12.0f));
    addAndMakeVisible(label);
}
