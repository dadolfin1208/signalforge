#include "PluginBrowser.h"
#include "AudioEngine/PluginHost.h"

PluginBrowser::PluginBrowser()
{
    addAndMakeVisible(pluginListBox);
    pluginListBox.setModel(this);
    pluginListBox.setMultipleSelectionEnabled(false);

    scanButton.setButtonText("Scan Plugins");
    addAndMakeVisible(scanButton);
    scanButton.onClick = [this]() {
        if (pluginHost)
        {
            statusLabel.setText("Scanning plugins...", juce::dontSendNotification);
            pluginHost->scanForPlugins();
            refreshPluginList();
            statusLabel.setText("Scan complete", juce::dontSendNotification);
        }
    };

    loadButton.setButtonText("Load Plugin");
    addAndMakeVisible(loadButton);
    loadButton.onClick = [this]() {
        if (selectedPluginIndex >= 0 && selectedPluginIndex < availablePlugins.size())
        {
            if (onPluginSelected)
                onPluginSelected(availablePlugins[selectedPluginIndex]);
        }
    };

    statusLabel.setText("No plugins scanned", juce::dontSendNotification);
    addAndMakeVisible(statusLabel);

    setSize(400, 300);
}

PluginBrowser::~PluginBrowser()
{
}

void PluginBrowser::paint(juce::Graphics& g)
{
    g.fillAll(juce::Colours::darkgrey);
    g.setColour(juce::Colours::white);
    g.drawRect(getLocalBounds(), 1);
}

void PluginBrowser::resized()
{
    auto bounds = getLocalBounds().reduced(10);
    
    auto buttonArea = bounds.removeFromTop(30);
    scanButton.setBounds(buttonArea.removeFromLeft(100));
    buttonArea.removeFromLeft(10);
    loadButton.setBounds(buttonArea.removeFromLeft(100));
    
    bounds.removeFromTop(10);
    statusLabel.setBounds(bounds.removeFromTop(20));
    bounds.removeFromTop(10);
    
    pluginListBox.setBounds(bounds);
}

int PluginBrowser::getNumRows()
{
    return availablePlugins.size();
}

void PluginBrowser::paintListBoxItem(int rowNumber, juce::Graphics& g, int width, int height, bool rowIsSelected)
{
    if (rowIsSelected)
        g.fillAll(juce::Colours::lightblue);
    else
        g.fillAll(juce::Colours::white);

    g.setColour(juce::Colours::black);
    
    if (rowNumber < availablePlugins.size())
    {
        const auto& plugin = availablePlugins[rowNumber];
        juce::String text = plugin.name + " (" + plugin.manufacturerName + ")";
        g.drawText(text, 5, 0, width - 10, height, juce::Justification::centredLeft);
    }
}

void PluginBrowser::listBoxItemDoubleClicked(int row, const juce::MouseEvent& e)
{
    juce::ignoreUnused(e);
    selectedPluginIndex = row;
    if (onPluginSelected && row >= 0 && row < availablePlugins.size())
    {
        onPluginSelected(availablePlugins[row]);
    }
}

void PluginBrowser::setPluginHost(PluginHost* host)
{
    pluginHost = host;
    refreshPluginList();
}

void PluginBrowser::refreshPluginList()
{
    availablePlugins.clear();
    selectedPluginIndex = -1;
    
    if (pluginHost)
    {
        const auto& pluginList = pluginHost->getPluginList();
        for (const auto& type : pluginList.getTypes())
        {
            availablePlugins.add(type);
        }
    }
    
    pluginListBox.updateContent();
    statusLabel.setText("Found " + juce::String(availablePlugins.size()) + " plugins", 
                       juce::dontSendNotification);
}
