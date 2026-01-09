#pragma once
#include <JuceHeader.h>

class MidiManager : public juce::MidiInputCallback
{
public:
    MidiManager();
    ~MidiManager();

    // MIDI input
    void enableMidiInput(const juce::String& deviceName);
    void disableMidiInput();
    void handleIncomingMidiMessage(juce::MidiInput* source, const juce::MidiMessage& message) override;

    // MIDI output
    void enableMidiOutput(const juce::String& deviceName);
    void disableMidiOutput();
    void sendMidiMessage(const juce::MidiMessage& message);

    // Device management
    juce::StringArray getAvailableInputDevices() const;
    juce::StringArray getAvailableOutputDevices() const;

    // Callbacks
    std::function<void(const juce::MidiMessage&)> onMidiReceived;

private:
    std::unique_ptr<juce::MidiInput> midiInput;
    std::unique_ptr<juce::MidiOutput> midiOutput;
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(MidiManager)
};
