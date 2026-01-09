#include "WaveformDisplay.h"

WaveformDisplay::WaveformDisplay() 
    : thumbnailCache(5),
      thumbnail(512, formatManager, thumbnailCache)
{
    formatManager.registerBasicFormats();
    thumbnail.addChangeListener(this);
    setSize(400, 100);
}

WaveformDisplay::~WaveformDisplay()
{
    thumbnail.removeChangeListener(this);
}

void WaveformDisplay::paint(juce::Graphics& g)
{
    g.fillAll(juce::Colours::black);
    g.setColour(juce::Colours::white);
    g.drawRect(getLocalBounds(), 1);

    if (fileLoaded)
    {
        g.setColour(juce::Colours::lightblue);
        thumbnail.drawChannels(g, getLocalBounds().reduced(2), 0.0, thumbnail.getTotalLength(), 1.0f);
        
        // Draw playhead
        if (thumbnail.getTotalLength() > 0.0)
        {
            auto playheadX = static_cast<float>(currentPosition * getWidth());
            g.setColour(juce::Colours::red);
            g.drawVerticalLine(static_cast<int>(playheadX), 0.0f, static_cast<float>(getHeight()));
        }
    }
    else
    {
        g.setColour(juce::Colours::grey);
        g.setFont(14.0f);
        g.drawText("No audio file loaded", getLocalBounds(), juce::Justification::centred);
    }
}

void WaveformDisplay::resized()
{
    // Component resized
}

void WaveformDisplay::loadAudioFile(const juce::File& file)
{
    thumbnail.setSource(new juce::FileInputSource(file));
    fileLoaded = true;
    repaint();
}

void WaveformDisplay::setPositionRelative(double position)
{
    if (currentPosition != position)
    {
        currentPosition = position;
        repaint();
    }
}

void WaveformDisplay::changeListenerCallback(juce::ChangeBroadcaster* source)
{
    if (source == &thumbnail)
        repaint();
}
