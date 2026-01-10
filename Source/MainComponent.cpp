#include "MainComponent.h"
#include "../Core/API/APIManager.h"
#include "../Core/Auth/ProtocolHandler.h"
#include "GUI/SimpleDAW.h"

MainComponent::MainComponent()
{
    // Create the main DAW interface
    signalForgeDAW = std::make_unique<SimpleDAW>();
    addAndMakeVisible(*signalForgeDAW);
    
    // Initialize API
    auto& apiManager = APIManager::getInstance();
    apiManager.onAuthStateChanged = [this](bool authenticated) {
        handleAuthStateChanged(authenticated);
    };
    
    apiManager.onProcessingComplete = [this](const String& type, var result) {
        handleProcessingComplete(type, result);
    };
    
    // Register protocol handler
    ProtocolHandler::registerProtocol();
    
    setSize(1400, 900);
    startTimer(100);
}

MainComponent::~MainComponent()
{
    stopTimer();
}

void MainComponent::paint(juce::Graphics& g)
{
    // The SignalForgeDAW component handles all painting
    g.fillAll(juce::Colour(0xff2d2d2d));
}

void MainComponent::resized()
{
    // Fill entire window with the DAW interface
    if (signalForgeDAW)
        signalForgeDAW->setBounds(getLocalBounds());
}

void MainComponent::timerCallback()
{
    // Update any global state if needed
    repaint();
}

void MainComponent::handleAuthStateChanged(bool authenticated)
{
    if (authenticated) {
        DBG("User authenticated successfully");
        // Update UI to show authenticated state
    } else {
        DBG("User authentication failed or logged out");
        // Update UI to show unauthenticated state
    }
}

void MainComponent::handleProcessingComplete(const String& type, var result)
{
    DBG("Processing complete: " + type);
    
    if (type == "mixing") {
        // Handle mixing results
        if (result.hasProperty("suggestions")) {
            DBG("Mixing suggestions received");
        }
    } else if (type == "mastering") {
        // Handle mastering results
        if (result.hasProperty("processed_file_url")) {
            String processedUrl = result["processed_file_url"].toString();
            DBG("Mastered file available: " + processedUrl);
        }
    } else if (type == "stems") {
        // Handle stem separation results
        if (result.hasProperty("stems")) {
            var stems = result["stems"];
            DBG("Stems separated successfully");
        }
    }
}
