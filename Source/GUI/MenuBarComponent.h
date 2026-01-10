#pragma once
#include <JuceHeader.h>

class MenuBarComponent : public juce::Component,
                        public juce::MenuBarModel
{
public:
    MenuBarComponent();
    ~MenuBarComponent() override;

    void paint(juce::Graphics& g) override;
    void resized() override;

    // MenuBarModel implementation
    juce::StringArray getMenuBarNames() override;
    juce::PopupMenu getMenuForIndex(int topLevelMenuIndex, const juce::String& menuName) override;
    void menuItemSelected(int menuItemID, int topLevelMenuIndex) override;

private:
    std::unique_ptr<juce::MenuBarComponent> menuBarComponent;
    
    // Menu IDs
    enum MenuIDs
    {
        // File menu
        newProject = 1000,
        openProject,
        saveProject,
        saveProjectAs,
        exportAudio,
        exitApp,
        
        // Edit menu
        undo = 2000,
        redo,
        cut,
        copy,
        paste,
        selectAll,
        
        // View menu
        showMixer = 3000,
        showBrowser,
        showEffects,
        fullScreen,
        
        // Track menu
        addAudioTrack = 4000,
        addMidiTrack,
        deleteTrack,
        duplicateTrack,
        
        // AI menu
        aiMixing = 5000,
        aiMastering,
        stemSeparation,
        
        // Help menu
        about = 6000,
        userManual,
        shortcuts
    };
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(MenuBarComponent)
};
