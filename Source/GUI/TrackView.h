#pragma once
#include <JuceHeader.h>

class TrackView : public juce::Component,
                  public juce::FileDragAndDropTarget
{
public:
    TrackView();
    ~TrackView() override;

    void paint(juce::Graphics& g) override;
    void resized() override;

    // File drag and drop
    bool isInterestedInFileDrag(const juce::StringArray& files) override;
    void fileDragEnter(const juce::StringArray& files, int x, int y) override;
    void fileDragExit(const juce::StringArray& files) override;
    void filesDropped(const juce::StringArray& files, int x, int y) override;

    // Callbacks
    std::function<void(const juce::File&, int trackIndex)> onFileDropped;

private:
    bool isDragOver = false;
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(TrackView)
};
