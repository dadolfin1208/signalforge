#pragma once
#include <JuceHeader.h>

class AudioEngine;

class ProjectManager
{
public:
    ProjectManager(AudioEngine& engine);
    ~ProjectManager();

    // Project operations
    bool saveProject(const juce::File& file);
    bool loadProject(const juce::File& file);
    bool newProject();

    // Project state
    void setProjectFile(const juce::File& file) { currentProjectFile = file; }
    juce::File getProjectFile() const { return currentProjectFile; }
    bool hasUnsavedChanges() const { return unsavedChanges; }
    void markAsChanged() { unsavedChanges = true; }
    void markAsSaved() { unsavedChanges = false; }

    // Project info
    void setProjectName(const juce::String& name) { projectName = name; }
    juce::String getProjectName() const { return projectName; }

private:
    AudioEngine& audioEngine;
    juce::File currentProjectFile;
    juce::String projectName = "Untitled Project";
    bool unsavedChanges = false;

    juce::ValueTree createProjectXML();
    bool parseProjectXML(const juce::ValueTree& xml);

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(ProjectManager)
};
