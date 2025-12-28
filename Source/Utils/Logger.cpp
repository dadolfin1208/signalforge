#include "Logger.h"

// Define the static member outside the class
std::unique_ptr<juce::FileLogger> SignalForgeLogger::fileLoggerInstance;