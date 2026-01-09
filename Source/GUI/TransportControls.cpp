#include "TransportControls.h"

TransportControls::TransportControls()
{
    playButton = std::make_unique<juce::TextButton>("Play");
    stopButton = std::make_unique<juce::TextButton>("Stop");
    recordButton = std::make_unique<juce::TextButton>("Record");
    
    addAndMakeVisible(*playButton);
    addAndMakeVisible(*stopButton);
    addAndMakeVisible(*recordButton);
    
    // Connect button callbacks
    playButton->onClick = [this]() { if (onPlayClicked) onPlayClicked(); };
    stopButton->onClick = [this]() { if (onStopClicked) onStopClicked(); };
    recordButton->onClick = [this]() { if (onRecordClicked) onRecordClicked(); };
    
    setSize(300, 60);
}

TransportControls::~TransportControls()
{
}

void TransportControls::paint(juce::Graphics& g)
{
    g.fillAll(juce::Colours::darkslategrey);
}

void TransportControls::resized()
{
    auto bounds = getLocalBounds().reduced(10);
    auto buttonWidth = bounds.getWidth() / 3 - 5;
    
    playButton->setBounds(bounds.removeFromLeft(buttonWidth));
    bounds.removeFromLeft(5);
    stopButton->setBounds(bounds.removeFromLeft(buttonWidth));
    bounds.removeFromLeft(5);
    recordButton->setBounds(bounds.removeFromLeft(buttonWidth));
}
