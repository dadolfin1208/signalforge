#include "SignalForgeDAW.h"
#include "MenuBarComponent.h"
#include "TransportBarComponent.h"
#include "DAWComponents.h"

SignalForgeDAW::SignalForgeDAW()
{
    // Set professional dark theme colors
    backgroundColour = juce::Colour(0xff2d2d2d);  // Dark grey
    panelColour = juce::Colour(0xff3d3d3d);       // Lighter grey
    accentColour = juce::Colour(0xff007cba);      // Signal Forge blue
    
    // Create main components
    menuBar = std::make_unique<MenuBarComponent>();
    transportBar = std::make_unique<TransportBarComponent>();
    trackArea = std::make_unique<TrackAreaComponent>();
    mixerPanel = std::make_unique<MixerPanelComponent>();
    browserPanel = std::make_unique<BrowserPanelComponent>();
    statusBar = std::make_unique<StatusBarComponent>();
    
    // Add components
    addAndMakeVisible(*menuBar);
    addAndMakeVisible(*transportBar);
    addAndMakeVisible(*trackArea);
    addAndMakeVisible(*mixerPanel);
    addAndMakeVisible(*browserPanel);
    addAndMakeVisible(*statusBar);
    
    // Set up layout manager
    mainLayout = std::make_unique<juce::StretchableLayoutManager>();
    
    // Create resizable dividers
    horizontalDivider = std::make_unique<juce::StretchableLayoutResizerBar>(
        mainLayout.get(), 1, false);
    verticalDivider = std::make_unique<juce::StretchableLayoutResizerBar>(
        mainLayout.get(), 2, true);
    
    addAndMakeVisible(*horizontalDivider);
    addAndMakeVisible(*verticalDivider);
    
    // Set window properties
    setSize(1400, 900);
    setWantsKeyboardFocus(true);
    
    // Start timer for UI updates
    startTimer(50); // 20 FPS
}

SignalForgeDAW::~SignalForgeDAW()
{
    stopTimer();
}

void SignalForgeDAW::paint(juce::Graphics& g)
{
    // Fill background with dark theme
    g.fillAll(backgroundColour);
    
    // Draw Signal Forge logo/icon in top-left
    g.setColour(accentColour);
    g.setFont(juce::Font(24.0f));
    g.drawText("🎼", 10, 5, 40, 30, juce::Justification::centred);
    
    // Draw subtle grid pattern
    g.setColour(panelColour.withAlpha(0.3f));
    for (int x = 0; x < getWidth(); x += 20)
    {
        g.drawVerticalLine(x, 0.0f, (float)getHeight());
    }
    for (int y = 0; y < getHeight(); y += 20)
    {
        g.drawHorizontalLine(y, 0.0f, (float)getWidth());
    }
}

void SignalForgeDAW::resized()
{
    auto area = getLocalBounds();
    
    // Menu bar at top (40px height)
    menuBar->setBounds(area.removeFromTop(40));
    
    // Transport bar below menu (60px height)
    transportBar->setBounds(area.removeFromTop(60));
    
    // Status bar at bottom (25px height)
    statusBar->setBounds(area.removeFromBottom(25));
    
    // Split remaining area
    auto leftPanel = area.removeFromLeft(300);  // Browser panel
    auto rightPanel = area.removeFromRight(250); // Mixer panel
    
    // Set component bounds
    browserPanel->setBounds(leftPanel);
    mixerPanel->setBounds(rightPanel);
    trackArea->setBounds(area); // Remaining center area
    
    // Position dividers
    verticalDivider->setBounds(leftPanel.getRight() - 2, leftPanel.getY(), 4, leftPanel.getHeight());
    horizontalDivider->setBounds(area.getRight() - 2, area.getY(), 4, area.getHeight());
}

void SignalForgeDAW::timerCallback()
{
    // Update UI elements that need regular refresh
    repaint();
}
