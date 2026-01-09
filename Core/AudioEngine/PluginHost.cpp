#include "PluginHost.h"

PluginHost::PluginHost()
{
#ifdef SIGNALFORGE_PLUGINS
    // Register plugin formats (VST3 and AU only - VST2 requires SDK)
    formatManager.addFormat(std::make_unique<juce::VST3PluginFormat>());
    
#if JUCE_MAC
    formatManager.addFormat(std::make_unique<juce::AudioUnitPluginFormat>());
#endif

#if JUCE_PLUGINHOST_LV2
    formatManager.addFormat(std::make_unique<juce::LV2PluginFormat>());
#endif
    
    juce::Logger::writeToLog("Plugin host initialized with VST3/AU/LV2 format support");
#else
    juce::Logger::writeToLog("Plugin host initialized (placeholder mode - formats not available)");
#endif
}

PluginHost::~PluginHost()
{
    unloadPlugin();
}

void PluginHost::prepareToPlay(double sampleRate, int samplesPerBlock)
{
    currentSampleRate = sampleRate;
    currentBlockSize = samplesPerBlock;
    
    if (plugin)
    {
        plugin->prepareToPlay(sampleRate, samplesPerBlock);
    }
}

void PluginHost::processBlock(juce::AudioBuffer<float>& buffer, juce::MidiBuffer& midiBuffer)
{
    if (plugin)
    {
        plugin->processBlock(buffer, midiBuffer);
    }
}

void PluginHost::releaseResources()
{
    if (plugin)
    {
        plugin->releaseResources();
    }
}

bool PluginHost::loadPlugin(const juce::PluginDescription& description)
{
    juce::Logger::writeToLog("Attempting to load plugin: " + description.name);
    unloadPlugin();
    
#ifdef SIGNALFORGE_PLUGINS
    juce::String errorMessage;
    juce::Logger::writeToLog("Creating plugin instance...");
    auto pluginInstance = formatManager.createPluginInstance(description, currentSampleRate, currentBlockSize, errorMessage);
    
    if (pluginInstance)
    {
        plugin = std::move(pluginInstance);
        plugin->prepareToPlay(currentSampleRate, currentBlockSize);
        juce::Logger::writeToLog("Successfully loaded plugin: " + description.name);
        return true;
    }
    else
    {
        juce::Logger::writeToLog("Failed to load plugin: " + description.name + " - Error: " + errorMessage);
        return false;
    }
#else
    juce::Logger::writeToLog("Plugin loading placeholder: " + description.name);
    return false;
#endif
}

void PluginHost::unloadPlugin()
{
    if (plugin)
    {
        plugin->releaseResources();
        plugin.reset();
    }
}

void PluginHost::scanForPlugins()
{
    knownPluginList.clear();
    
#ifdef SIGNALFORGE_PLUGINS
    // Scan for plugins in default locations
    for (int i = 0; i < formatManager.getNumFormats(); ++i)
    {
        auto* format = formatManager.getFormat(i);
        auto pluginPaths = format->getDefaultLocationsToSearch();
        
        for (int pathIndex = 0; pathIndex < pluginPaths.getNumPaths(); ++pathIndex)
        {
            auto path = pluginPaths[pathIndex];
            juce::FileSearchPath searchPath(path.getFullPathName());
            
            scanner = std::make_unique<juce::PluginDirectoryScanner>(
                knownPluginList, *format, searchPath, true, juce::File{});
            
            juce::String pluginBeingScanned;
            while (scanner->scanNextFile(false, pluginBeingScanned))
            {
                juce::Logger::writeToLog("Scanning: " + pluginBeingScanned);
            }
        }
    }
#else
    // Add demo plugin for testing
    juce::PluginDescription demoPlugin;
    demoPlugin.name = "Demo Plugin";
    demoPlugin.manufacturerName = "SignalForge";
    demoPlugin.pluginFormatName = "Internal";
    demoPlugin.category = "Effect";
    demoPlugin.isInstrument = false;
    knownPluginList.addType(demoPlugin);
#endif
    
    juce::Logger::writeToLog("Plugin scan complete. Found " + 
                            juce::String(knownPluginList.getTypes().size()) + " plugins.");
}

juce::AudioProcessorEditor* PluginHost::createEditor()
{
    if (plugin && plugin->hasEditor())
    {
        return plugin->createEditor();
    }
    return nullptr;
}

void PluginHost::closeEditor()
{
    if (plugin && plugin->getActiveEditor())
    {
        delete plugin->getActiveEditor();
    }
}

void PluginHost::getStateInformation(juce::MemoryBlock& destData)
{
    if (plugin)
    {
        plugin->getStateInformation(destData);
    }
}

void PluginHost::setStateInformation(const void* data, int sizeInBytes)
{
    if (plugin)
    {
        plugin->setStateInformation(data, sizeInBytes);
    }
}
