#include <juce_gui_basics/juce_gui_basics.h>
#include <juce_audio_devices/juce_audio_devices.h>

#include "MainComponent.h"
#include "Utils/Logger.h"

class SignalForgeApplication;
static SignalForgeApplication& getApp();

class SignalForgeApplication final : public juce::JUCEApplication
{
public:
    SignalForgeApplication() {}

    const juce::String getApplicationName() override       { return "SignalForge"; }
    const juce::String getApplicationVersion() override    { return "0.1.0"; }
    bool moreThanOneInstanceAllowed() override             { return true; }

    void initialise(const juce::String&) override
    {
        SignalForgeLogger::init();
        mainWindow.reset(new MainWindow(getApplicationName()));
    }

    void shutdown() override
    {
        mainWindow = nullptr;
        SignalForgeLogger::shutdown();
    }

    void systemRequestedQuit() override
    {
        quit();
    }

    void anotherInstanceStarted(const juce::String&) override {}

    juce::ApplicationCommandManager& getCommandManager() { return commandManager; }

private:
    class MainWindow final : public juce::DocumentWindow,
                             public juce::MenuBarModel,
                             public juce::ApplicationCommandTarget
    {
    public:
        explicit MainWindow(juce::String name)
            : DocumentWindow(name,
                             juce::Desktop::getInstance().getDefaultLookAndFeel()
                                 .findColour(juce::ResizableWindow::backgroundColourId),
                             DocumentWindow::allButtons)
        {
            setUsingNativeTitleBar(true);
            setContentOwned(new MainComponent(), true);

           #if JUCE_MAC
            setMenuBar(this);
           #else
            setMenuBar(this);
           #endif

            centreWithSize(getWidth(), getHeight());
            setVisible(true);

            getApp().getCommandManager().registerAllCommandsForTarget(this);
            addKeyListener(getApp().getCommandManager().getKeyMappings());
        }

        ~MainWindow() override
        {
            setMenuBar(nullptr);
        }

        void closeButtonPressed() override
        {
            juce::JUCEApplication::getInstance()->systemRequestedQuit();
        }

        enum CommandIDs
        {
            fileQuit = 1,
            helpAbout,
        };

        juce::ApplicationCommandTarget* getNextCommandTarget() override
        {
            return findFirstTargetParentComponent();
        }

        void getAllCommands(juce::Array<juce::CommandID>& commands) override
        {
            const juce::CommandID ids[] = { fileQuit, helpAbout };
            commands.addArray(ids, juce::numElementsInArray(ids));
        }

        void getCommandInfo(juce::CommandID commandID, juce::ApplicationCommandInfo& result) override
        {
            switch (commandID)
            {
            case fileQuit:
                result.setInfo("Quit", "Quits the application", "File", 0);
                result.addDefaultKeypress('q', juce::ModifierKeys::commandModifier);
                break;
            case helpAbout:
                result.setInfo("About", "Shows the about dialog", "Help", 0);
                break;
            default:
                break;
            }
        }

        bool perform(const InvocationInfo& info) override
        {
            switch (info.commandID)
            {
            case fileQuit:
                juce::JUCEApplication::getInstance()->systemRequestedQuit();
                break;
            case helpAbout:
                juce::AlertWindow::showMessageBoxAsync(juce::AlertWindow::InfoIcon,
                                                       "About SignalForge",
                                                       "SignalForge v0.1.0\n\nA basic audio application.");
                break;
            default:
                return false;
            }

            return true;
        }

        juce::StringArray getMenuBarNames() override
        {
            return { "File", "Help" };
        }

        juce::PopupMenu getMenuForIndex(int topLevelMenuIndex, const juce::String& /*menuName*/) override
        {
            juce::PopupMenu menu;
            juce::ApplicationCommandManager& commandManager = getApp().getCommandManager();

            if (topLevelMenuIndex == 0) // File
                menu.addCommandItem(&commandManager, fileQuit);
            else if (topLevelMenuIndex == 1) // Help
                menu.addCommandItem(&commandManager, helpAbout);

            return menu;
        }

        void menuItemSelected(int /*menuItemID*/, int /*topLevelMenuIndex*/) override
        {
            // This is the callback for when a menu item is selected, but we are using ApplicationCommandManager so this can be empty.
        }
    };

    std::unique_ptr<MainWindow> mainWindow;
    juce::ApplicationCommandManager commandManager;
};

static SignalForgeApplication& getApp()
{
    return *dynamic_cast<SignalForgeApplication*>(juce::JUCEApplication::getInstance());
}

START_JUCE_APPLICATION(SignalForgeApplication)
