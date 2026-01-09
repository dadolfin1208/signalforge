#pragma once
#include <JuceHeader.h>

class MidiManager;

class MidiSettingsPanel : public juce::Component
{
public:
    MidiSettingsPanel(MidiManager& midiManager);
    ~MidiSettingsPanel() override;

    void paint(juce::Graphics& g) override;
    void resized() override;

private:
    void updateDeviceLists();

    MidiManager& midiManager;
    
    juce::Label inputLabel;
    juce::ComboBox inputDeviceCombo;
    juce::Label outputLabel;
    juce::ComboBox outputDeviceCombo;
    juce::TextButton refreshButton;
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(MidiSettingsPanel)
};
