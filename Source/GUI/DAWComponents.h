#pragma once
#include <JuceHeader.h>

class TrackAreaComponent : public juce::Component
{
public:
    TrackAreaComponent();
    ~TrackAreaComponent() override;
    void paint(juce::Graphics& g) override;
    void resized() override;

private:
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(TrackAreaComponent)
};

class MixerPanelComponent : public juce::Component
{
public:
    MixerPanelComponent();
    ~MixerPanelComponent() override;
    void paint(juce::Graphics& g) override;
    void resized() override;

private:
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(MixerPanelComponent)
};

class BrowserPanelComponent : public juce::Component
{
public:
    BrowserPanelComponent();
    ~BrowserPanelComponent() override;
    void paint(juce::Graphics& g) override;
    void resized() override;

private:
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(BrowserPanelComponent)
};

class StatusBarComponent : public juce::Component
{
public:
    StatusBarComponent();
    ~StatusBarComponent() override;
    void paint(juce::Graphics& g) override;
    void resized() override;

private:
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(StatusBarComponent)
};
