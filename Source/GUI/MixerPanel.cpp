#include "MixerPanel.h"

MixerPanel::MixerPanel()
{
    setSize(300, 600);
}

MixerPanel::~MixerPanel()
{
}

void MixerPanel::paint(juce::Graphics& g)
{
    g.fillAll(juce::Colours::black);
    g.setColour(juce::Colours::lightgreen);
    g.setFont(14.0f);
    g.drawText("Mixer Panel - Channel Strips", getLocalBounds(), 
               juce::Justification::centred, true);
}

void MixerPanel::resized()
{
    // Layout mixer channels here
}
