#pragma once

#include <JuceHeader.h>

class SignalForgeLogger
{
public:
    static void init()
    {
        // Explicitly clear any existing logger first
        juce::Logger::setCurrentLogger(nullptr);

        auto logFile = juce::File::getSpecialLocation(juce::File::SpecialLocationType::userApplicationDataDirectory)
            .getChildFile("SignalForge/logs/SignalForge.log");

        if (!logFile.getParentDirectory().exists())
            logFile.getParentDirectory().createDirectory();

        fileLoggerInstance = std::make_unique<juce::FileLogger>(logFile, "SignalForge Log");
        juce::Logger::setCurrentLogger(fileLoggerInstance.get());
        
        // Also log to the console in debug builds
       #if JUCE_DEBUG
        juce::Logger::outputDebugString("SignalForge logger initialized.");
       #endif
    }

    static void shutdown()
    {
        juce::Logger::setCurrentLogger(nullptr);
        fileLoggerInstance.reset(); // Explicitly delete the logger
    }

private:
    static std::unique_ptr<juce::FileLogger> fileLoggerInstance;
};
