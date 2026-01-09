#include "MidiManager.h"

MidiManager::MidiManager()
{
}

MidiManager::~MidiManager()
{
    disableMidiInput();
    disableMidiOutput();
}

void MidiManager::enableMidiInput(const juce::String& deviceName)
{
    disableMidiInput();
    
    auto devices = juce::MidiInput::getAvailableDevices();
    for (const auto& device : devices)
    {
        if (device.name == deviceName)
        {
            midiInput = juce::MidiInput::openDevice(device.identifier, this);
            if (midiInput)
            {
                midiInput->start();
                juce::Logger::writeToLog("MIDI input enabled: " + deviceName);
            }
            break;
        }
    }
}

void MidiManager::disableMidiInput()
{
    if (midiInput)
    {
        midiInput->stop();
        midiInput.reset();
    }
}

void MidiManager::handleIncomingMidiMessage(juce::MidiInput* source, const juce::MidiMessage& message)
{
    juce::ignoreUnused(source);
    
    // Log MIDI messages
    if (message.isNoteOn())
    {
        juce::Logger::writeToLog("MIDI Note On: " + juce::String(message.getNoteNumber()) + 
                                " Velocity: " + juce::String(message.getVelocity()));
    }
    else if (message.isNoteOff())
    {
        juce::Logger::writeToLog("MIDI Note Off: " + juce::String(message.getNoteNumber()));
    }
    else if (message.isController())
    {
        juce::Logger::writeToLog("MIDI CC: " + juce::String(message.getControllerNumber()) + 
                                " Value: " + juce::String(message.getControllerValue()));
    }
    
    // Forward to callback
    if (onMidiReceived)
        onMidiReceived(message);
}

void MidiManager::enableMidiOutput(const juce::String& deviceName)
{
    disableMidiOutput();
    
    auto devices = juce::MidiOutput::getAvailableDevices();
    for (const auto& device : devices)
    {
        if (device.name == deviceName)
        {
            midiOutput = juce::MidiOutput::openDevice(device.identifier);
            if (midiOutput)
            {
                juce::Logger::writeToLog("MIDI output enabled: " + deviceName);
            }
            break;
        }
    }
}

void MidiManager::disableMidiOutput()
{
    midiOutput.reset();
}

void MidiManager::sendMidiMessage(const juce::MidiMessage& message)
{
    if (midiOutput)
        midiOutput->sendMessageNow(message);
}

juce::StringArray MidiManager::getAvailableInputDevices() const
{
    juce::StringArray deviceNames;
    auto devices = juce::MidiInput::getAvailableDevices();
    for (const auto& device : devices)
        deviceNames.add(device.name);
    return deviceNames;
}

juce::StringArray MidiManager::getAvailableOutputDevices() const
{
    juce::StringArray deviceNames;
    auto devices = juce::MidiOutput::getAvailableDevices();
    for (const auto& device : devices)
        deviceNames.add(device.name);
    return deviceNames;
}
