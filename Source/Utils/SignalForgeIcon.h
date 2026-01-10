#pragma once
#include <JuceHeader.h>

class SignalForgeIcon
{
public:
    static juce::Image getIcon(int size = 64);
    static void setApplicationIcon();
    
private:
    static juce::Image createIconImage(int size);
};
