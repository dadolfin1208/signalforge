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

        logger = std::make_unique<juce::FileLogger>(logFile, "SignalForge Log");
        juce::Logger::setCurrentLogger(logger.get());
        
        // Also log to the console in debug builds
       #if JUCE_DEBUG
        juce::Logger::outputDebugString("SignalForge logger initialized.");
       #endif
    }

    static void shutdown()
    {
        juce::Logger::setCurrentLogger(nullptr);
        logger.reset();
    }

private:
    static std::unique_ptr<juce::FileLogger> logger;
};
