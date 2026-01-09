#pragma once
#include <JuceHeader.h>

class PluginHost;

class PluginBrowser : public juce::Component,
                      public juce::ListBoxModel
{
public:
    PluginBrowser();
    ~PluginBrowser() override;

    void paint(juce::Graphics& g) override;
    void resized() override;

    // ListBoxModel interface
    int getNumRows() override;
    void paintListBoxItem(int rowNumber, juce::Graphics& g, int width, int height, bool rowIsSelected) override;
    void listBoxItemDoubleClicked(int row, const juce::MouseEvent& e) override;

    void setPluginHost(PluginHost* host);
    void refreshPluginList();

    // Callbacks
    std::function<void(const juce::PluginDescription&)> onPluginSelected;

private:
    PluginHost* pluginHost = nullptr;
    juce::ListBox pluginListBox;
    juce::TextButton scanButton;
    juce::TextButton loadButton;
    juce::Label statusLabel;
    
    juce::Array<juce::PluginDescription> availablePlugins;
    int selectedPluginIndex = -1;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(PluginBrowser)
};
