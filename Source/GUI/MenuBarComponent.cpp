#include "MenuBarComponent.h"

MenuBarComponent::MenuBarComponent()
{
    menuBarComponent = std::make_unique<juce::MenuBarComponent>(this);
    addAndMakeVisible(*menuBarComponent);
    
    setSize(800, 40);
}

MenuBarComponent::~MenuBarComponent() = default;

void MenuBarComponent::paint(juce::Graphics& g)
{
    // Dark menu bar background
    g.fillAll(juce::Colour(0xff2d2d2d));
    
    // Draw Signal Forge branding
    g.setColour(juce::Colour(0xff007cba));
    g.setFont(juce::Font(16.0f));
    g.drawText("🎼 SignalForge", 10, 0, 150, getHeight(), juce::Justification::centredLeft);
}

void MenuBarComponent::resized()
{
    auto area = getLocalBounds();
    area.removeFromLeft(160); // Space for logo
    menuBarComponent->setBounds(area);
}

juce::StringArray MenuBarComponent::getMenuBarNames()
{
    return { "File", "Edit", "View", "Track", "AI", "Help" };
}

juce::PopupMenu MenuBarComponent::getMenuForIndex(int topLevelMenuIndex, const juce::String& menuName)
{
    juce::PopupMenu menu;
    
    if (menuName == "File")
    {
        menu.addItem(newProject, "New Project", true);
        menu.addItem(openProject, "Open Project...", true);
        menu.addSeparator();
        menu.addItem(saveProject, "Save Project", true);
        menu.addItem(saveProjectAs, "Save Project As...", true);
        menu.addSeparator();
        menu.addItem(exportAudio, "Export Audio...", true);
        menu.addSeparator();
        menu.addItem(exitApp, "Exit", true);
    }
    else if (menuName == "Edit")
    {
        menu.addItem(undo, "Undo", true);
        menu.addItem(redo, "Redo", true);
        menu.addSeparator();
        menu.addItem(cut, "Cut", true);
        menu.addItem(copy, "Copy", true);
        menu.addItem(paste, "Paste", true);
        menu.addSeparator();
        menu.addItem(selectAll, "Select All", true);
    }
    else if (menuName == "View")
    {
        menu.addItem(showMixer, "Show Mixer", true, true);
        menu.addItem(showBrowser, "Show Browser", true, true);
        menu.addItem(showEffects, "Show Effects", true, true);
        menu.addSeparator();
        menu.addItem(fullScreen, "Full Screen", true);
    }
    else if (menuName == "Track")
    {
        menu.addItem(addAudioTrack, "Add Audio Track", true);
        menu.addItem(addMidiTrack, "Add MIDI Track", true);
        menu.addSeparator();
        menu.addItem(deleteTrack, "Delete Track", true);
        menu.addItem(duplicateTrack, "Duplicate Track", true);
    }
    else if (menuName == "AI")
    {
        menu.addItem(aiMixing, "🎛️ AI Mixing Analysis", true);
        menu.addItem(aiMastering, "🎚️ AI Mastering", true);
        menu.addItem(stemSeparation, "🎵 Stem Separation", true);
    }
    else if (menuName == "Help")
    {
        menu.addItem(userManual, "User Manual", true);
        menu.addItem(shortcuts, "Keyboard Shortcuts", true);
        menu.addSeparator();
        menu.addItem(about, "About SignalForge", true);
    }
    
    return menu;
}

void MenuBarComponent::menuItemSelected(int menuItemID, int topLevelMenuIndex)
{
    switch (menuItemID)
    {
        case newProject:
            // TODO: Create new project
            break;
            
        case openProject:
            // TODO: Open project dialog
            break;
            
        case saveProject:
            // TODO: Save current project
            break;
            
        case aiMixing:
            // TODO: Launch AI mixing analysis
            break;
            
        case aiMastering:
            // TODO: Launch AI mastering
            break;
            
        case stemSeparation:
            // TODO: Launch stem separation
            break;
            
        case about:
            {
                juce::AlertWindow::showMessageBox(
                    juce::AlertWindow::InfoIcon,
                    "About SignalForge",
                    "🎼 SignalForge v1.0.0\n\n"
                    "Professional Digital Audio Workstation\n"
                    "with AI-Powered Processing\n\n"
                    "© Signal Forge. All rights reserved.\n"
                    "https://signal-forge.online"
                );
            }
            break;
            
        default:
            break;
    }
}
