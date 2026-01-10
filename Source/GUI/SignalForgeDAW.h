#pragma once
#include <JuceHeader.h>

// Forward declarations
class MenuBarComponent;
class TransportBarComponent;
class TrackAreaComponent;
class MixerPanelComponent;
class BrowserPanelComponent;
class StatusBarComponent;

class SignalForgeDAW : public juce::Component,
                       public juce::Timer
{
public:
    SignalForgeDAW();
    ~SignalForgeDAW() override;

    void paint(juce::Graphics& g) override;
    void resized() override;
    void timerCallback() override;

private:
    // Main layout areas
    std::unique_ptr<MenuBarComponent> menuBar;
    std::unique_ptr<TransportBarComponent> transportBar;
    std::unique_ptr<TrackAreaComponent> trackArea;
    std::unique_ptr<MixerPanelComponent> mixerPanel;
    std::unique_ptr<BrowserPanelComponent> browserPanel;
    std::unique_ptr<StatusBarComponent> statusBar;
    
    // Splitters for resizable panels
    std::unique_ptr<juce::StretchableLayoutManager> mainLayout;
    std::unique_ptr<juce::StretchableLayoutResizerBar> horizontalDivider;
    std::unique_ptr<juce::StretchableLayoutResizerBar> verticalDivider;
    
    // Colors and theme
    juce::Colour backgroundColour;
    juce::Colour panelColour;
    juce::Colour accentColour;
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(SignalForgeDAW)
};
