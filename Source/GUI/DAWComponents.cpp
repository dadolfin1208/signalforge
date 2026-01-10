#include "DAWComponents.h"

// TrackAreaComponent Implementation
TrackAreaComponent::TrackAreaComponent()
{
    setSize(800, 400);
}

TrackAreaComponent::~TrackAreaComponent() = default;

void TrackAreaComponent::paint(juce::Graphics& g)
{
    g.fillAll(juce::Colour(0xff2d2d2d));
    
    g.setColour(juce::Colour(0xff007cba));
    g.setFont(juce::Font(16.0f));
    g.drawText("🎵 Track Area", getLocalBounds(), juce::Justification::centred);
    
    // Draw track lanes
    g.setColour(juce::Colour(0xff4d4d4d));
    for (int i = 0; i < 8; ++i)
    {
        auto trackBounds = juce::Rectangle<int>(10, 50 + i * 40, getWidth() - 20, 35);
        g.drawRect(trackBounds);
        g.drawText("Track " + juce::String(i + 1), trackBounds.reduced(5), juce::Justification::centredLeft);
    }
}

void TrackAreaComponent::resized() {}

// MixerPanelComponent Implementation
MixerPanelComponent::MixerPanelComponent()
{
    setSize(250, 400);
}

MixerPanelComponent::~MixerPanelComponent() = default;

void MixerPanelComponent::paint(juce::Graphics& g)
{
    g.fillAll(juce::Colour(0xff3d3d3d));
    
    g.setColour(juce::Colour(0xff007cba));
    g.setFont(juce::Font(16.0f));
    g.drawText("🎛️ Mixer", 10, 10, getWidth() - 20, 30, juce::Justification::centred);
    
    // Draw mixer channels
    g.setColour(juce::Colour(0xff5d5d5d));
    int channelWidth = (getWidth() - 20) / 4;
    for (int i = 0; i < 4; ++i)
    {
        auto channelBounds = juce::Rectangle<int>(10 + i * channelWidth, 50, channelWidth - 5, getHeight() - 60);
        g.drawRect(channelBounds);
        g.drawText(juce::String(i + 1), channelBounds.removeFromTop(20), juce::Justification::centred);
    }
}

void MixerPanelComponent::resized() {}

// BrowserPanelComponent Implementation
BrowserPanelComponent::BrowserPanelComponent()
{
    setSize(300, 400);
}

BrowserPanelComponent::~BrowserPanelComponent() = default;

void BrowserPanelComponent::paint(juce::Graphics& g)
{
    g.fillAll(juce::Colour(0xff3d3d3d));
    
    g.setColour(juce::Colour(0xff007cba));
    g.setFont(juce::Font(16.0f));
    g.drawText("📁 Browser", 10, 10, getWidth() - 20, 30, juce::Justification::centred);
    
    // Draw file browser items
    g.setColour(juce::Colours::white);
    g.setFont(juce::Font(12.0f));
    juce::StringArray items = { "🎵 Audio Files", "🎹 MIDI Files", "🔌 Plugins", "🎛️ Presets", "📁 Projects" };
    
    for (int i = 0; i < items.size(); ++i)
    {
        auto itemBounds = juce::Rectangle<int>(10, 50 + i * 25, getWidth() - 20, 20);
        g.drawText(items[i], itemBounds, juce::Justification::centredLeft);
    }
}

void BrowserPanelComponent::resized() {}

// StatusBarComponent Implementation
StatusBarComponent::StatusBarComponent()
{
    setSize(800, 25);
}

StatusBarComponent::~StatusBarComponent() = default;

void StatusBarComponent::paint(juce::Graphics& g)
{
    g.fillAll(juce::Colour(0xff4d4d4d));
    
    g.setColour(juce::Colours::white);
    g.setFont(juce::Font(11.0f));
    
    // Status information
    g.drawText("🎼 SignalForge v1.0.0", 10, 0, 150, getHeight(), juce::Justification::centredLeft);
    g.drawText("Ready", getWidth() - 100, 0, 90, getHeight(), juce::Justification::centredRight);
    
    // Draw separator
    g.setColour(juce::Colour(0xff6d6d6d));
    g.drawHorizontalLine(0, 0.0f, (float)getWidth());
}

void StatusBarComponent::resized() {}
