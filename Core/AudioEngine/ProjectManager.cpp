#include "ProjectManager.h"
#include "AudioEngine.h"
#include "Track.h"

ProjectManager::ProjectManager(AudioEngine& engine) : audioEngine(engine)
{
}

ProjectManager::~ProjectManager()
{
}

bool ProjectManager::saveProject(const juce::File& file)
{
    auto projectXML = createProjectXML();
    
    if (!file.getParentDirectory().exists())
        file.getParentDirectory().createDirectory();

    auto xmlString = projectXML.toXmlString();
    
    if (file.replaceWithText(xmlString))
    {
        currentProjectFile = file;
        markAsSaved();
        juce::Logger::writeToLog("Project saved: " + file.getFullPathName());
        return true;
    }
    
    juce::Logger::writeToLog("Failed to save project: " + file.getFullPathName());
    return false;
}

bool ProjectManager::loadProject(const juce::File& file)
{
    if (!file.exists())
    {
        juce::Logger::writeToLog("Project file not found: " + file.getFullPathName());
        return false;
    }

    auto xmlString = file.loadFileAsString();
    auto xml = juce::ValueTree::fromXml(xmlString);
    
    if (xml.isValid() && parseProjectXML(xml))
    {
        currentProjectFile = file;
        markAsSaved();
        juce::Logger::writeToLog("Project loaded: " + file.getFullPathName());
        return true;
    }
    
    juce::Logger::writeToLog("Failed to load project: " + file.getFullPathName());
    return false;
}

bool ProjectManager::newProject()
{
    // Clear all tracks
    while (audioEngine.getNumTracks() > 0)
        audioEngine.removeTrack(0);
    
    // Reset project state
    currentProjectFile = juce::File{};
    projectName = "Untitled Project";
    markAsSaved();
    
    juce::Logger::writeToLog("New project created");
    return true;
}

juce::ValueTree ProjectManager::createProjectXML()
{
    juce::ValueTree project("SignalForgeProject");
    project.setProperty("version", "1.0", nullptr);
    project.setProperty("name", projectName, nullptr);
    
    // Save tracks
    juce::ValueTree tracks("Tracks");
    for (int i = 0; i < audioEngine.getNumTracks(); ++i)
    {
        if (auto* track = audioEngine.getTrack(i))
        {
            juce::ValueTree trackXML("Track");
            trackXML.setProperty("name", track->getName(), nullptr);
            trackXML.setProperty("gain", track->getGain(), nullptr);
            trackXML.setProperty("muted", track->isMuted(), nullptr);
            trackXML.setProperty("solo", track->isSolo(), nullptr);
            
            tracks.appendChild(trackXML, nullptr);
        }
    }
    project.appendChild(tracks, nullptr);
    
    return project;
}

bool ProjectManager::parseProjectXML(const juce::ValueTree& xml)
{
    if (!xml.hasType("SignalForgeProject"))
        return false;
    
    // Clear existing tracks
    while (audioEngine.getNumTracks() > 0)
        audioEngine.removeTrack(0);
    
    // Load project info
    projectName = xml.getProperty("name", "Untitled Project");
    
    // Load tracks
    auto tracksXML = xml.getChildWithName("Tracks");
    if (tracksXML.isValid())
    {
        for (int i = 0; i < tracksXML.getNumChildren(); ++i)
        {
            auto trackXML = tracksXML.getChild(i);
            if (trackXML.hasType("Track"))
            {
                auto trackName = trackXML.getProperty("name", "Track");
                int trackIndex = audioEngine.addTrack(trackName);
                
                if (auto* track = audioEngine.getTrack(trackIndex))
                {
                    track->setGain(trackXML.getProperty("gain", 1.0f));
                    track->setMuted(trackXML.getProperty("muted", false));
                    track->setSolo(trackXML.getProperty("solo", false));
                }
            }
        }
    }
    
    return true;
}
