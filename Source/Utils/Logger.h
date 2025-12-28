#pragma once

#include <JuceHeader.h>

class SignalForgeLogger
{
public:
    static void init()
    {
        auto logFile = juce::File::getSpecialLocation(juce::File::SpecialLocationType::userApplicationDataDirectory)
            .getChildFile("SignalForge/logs/SignalForge.log");

        if (!logFile.getParentDirectory().exists())
            logFile.getParentDirectory().createDirectory();

        juce::Logger::setCurrentLogger(new juce::FileLogger(logFile, "SignalForge Log"));
        
        // Also log to the console in debug builds
       #if JUCE_DEBUG
        juce::Logger::outputDebugString("SignalForge logger initialized.");
       #endif
    }

    static void shutdown()
    {
        juce::Logger::setCurrentLogger(nullptr);
    }
};
