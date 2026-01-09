#include "MidiSettingsPanel.h"
#include "AudioEngine/MidiManager.h"

MidiSettingsPanel::MidiSettingsPanel(MidiManager& manager) : midiManager(manager)
{
    inputLabel.setText("MIDI Input:", juce::dontSendNotification);
    outputLabel.setText("MIDI Output:", juce::dontSendNotification);
    refreshButton.setButtonText("Refresh");
    
    addAndMakeVisible(inputLabel);
    addAndMakeVisible(inputDeviceCombo);
    addAndMakeVisible(outputLabel);
    addAndMakeVisible(outputDeviceCombo);
    addAndMakeVisible(refreshButton);
    
    // Setup combo box callbacks
    inputDeviceCombo.onChange = [this]() {
        auto selectedText = inputDeviceCombo.getText();
        if (selectedText.isNotEmpty() && selectedText != "None")
            midiManager.enableMidiInput(selectedText);
        else
            midiManager.disableMidiInput();
    };
    
    outputDeviceCombo.onChange = [this]() {
        auto selectedText = outputDeviceCombo.getText();
        if (selectedText.isNotEmpty() && selectedText != "None")
            midiManager.enableMidiOutput(selectedText);
        else
            midiManager.disableMidiOutput();
    };
    
    refreshButton.onClick = [this]() { updateDeviceLists(); };
    
    updateDeviceLists();
    setSize(300, 120);
}

MidiSettingsPanel::~MidiSettingsPanel()
{
}

void MidiSettingsPanel::paint(juce::Graphics& g)
{
    g.fillAll(juce::Colours::darkgrey);
    g.setColour(juce::Colours::white);
    g.drawRect(getLocalBounds(), 1);
}

void MidiSettingsPanel::resized()
{
    auto bounds = getLocalBounds().reduced(10);
    
    inputLabel.setBounds(bounds.removeFromTop(20));
    inputDeviceCombo.setBounds(bounds.removeFromTop(25));
    bounds.removeFromTop(5);
    
    outputLabel.setBounds(bounds.removeFromTop(20));
    outputDeviceCombo.setBounds(bounds.removeFromTop(25));
    bounds.removeFromTop(5);
    
    refreshButton.setBounds(bounds.removeFromTop(25));
}

void MidiSettingsPanel::updateDeviceLists()
{
    // Update input devices
    inputDeviceCombo.clear();
    inputDeviceCombo.addItem("None", 1);
    auto inputDevices = midiManager.getAvailableInputDevices();
    for (int i = 0; i < inputDevices.size(); ++i)
        inputDeviceCombo.addItem(inputDevices[i], i + 2);
    
    // Update output devices
    outputDeviceCombo.clear();
    outputDeviceCombo.addItem("None", 1);
    auto outputDevices = midiManager.getAvailableOutputDevices();
    for (int i = 0; i < outputDevices.size(); ++i)
        outputDeviceCombo.addItem(outputDevices[i], i + 2);
}
