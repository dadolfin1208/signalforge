#include "TrackView.h"

TrackView::TrackView()
{
    setSize(800, 400);
}

TrackView::~TrackView()
{
}

void TrackView::paint(juce::Graphics& g)
{
    if (isDragOver)
    {
        g.fillAll(juce::Colours::lightblue.withAlpha(0.3f));
        g.setColour(juce::Colours::blue);
        g.drawRect(getLocalBounds(), 2);
    }
    else
    {
        g.fillAll(juce::Colours::darkgrey);
    }
    
    g.setColour(juce::Colours::white);
    g.setFont(16.0f);
    
    if (isDragOver)
    {
        g.drawText("Drop audio files here to add to tracks", getLocalBounds(), 
                   juce::Justification::centred, true);
    }
    else
    {
        g.drawText("Track View - Multi-track Timeline\nDrag audio files here", getLocalBounds(), 
                   juce::Justification::centred, true);
    }
}

void TrackView::resized()
{
    // Layout track lanes here
}

bool TrackView::isInterestedInFileDrag(const juce::StringArray& files)
{
    for (const auto& file : files)
    {
        if (file.endsWithIgnoreCase(".wav") || 
            file.endsWithIgnoreCase(".mp3") || 
            file.endsWithIgnoreCase(".aiff") ||
            file.endsWithIgnoreCase(".flac") ||
            file.endsWithIgnoreCase(".ogg"))
        {
            return true;
        }
    }
    return false;
}

void TrackView::fileDragEnter(const juce::StringArray& files, int x, int y)
{
    juce::ignoreUnused(files, x, y);
    isDragOver = true;
    repaint();
}

void TrackView::fileDragExit(const juce::StringArray& files)
{
    juce::ignoreUnused(files);
    isDragOver = false;
    repaint();
}

void TrackView::filesDropped(const juce::StringArray& files, int x, int y)
{
    isDragOver = false;
    repaint();
    
    // Calculate which track based on Y position
    int trackHeight = 60;
    int trackIndex = y / trackHeight;
    
    for (const auto& filePath : files)
    {
        juce::File audioFile(filePath);
        if (onFileDropped)
            onFileDropped(audioFile, trackIndex);
        
        trackIndex++; // Next file goes to next track
    }
}
