#include "SimpleDAW.h"
#include "../Utils/SignalForgeIcon.h"
#include "../../Core/API/Base44Client.h"

SimpleDAW::SimpleDAW() : isPlaying(false)
{
    // Initialize Base44 client
    base44Client = std::make_unique<Base44Client>();
    base44Client->initialize();
    
    // Create title label with musical note
    titleLabel = std::make_unique<juce::Label>("title", "🎼 SignalForge DAW v1.0.0");
    titleLabel->setFont(juce::Font(24.0f));
    titleLabel->setColour(juce::Label::textColourId, juce::Colour(0xff007cba));
    titleLabel->setJustificationType(juce::Justification::centred);
    addAndMakeVisible(*titleLabel);
    
    // Create transport buttons
    playButton = std::make_unique<juce::TextButton>("▶️ Play");
    stopButton = std::make_unique<juce::TextButton>("⏹️ Stop");
    recordButton = std::make_unique<juce::TextButton>("⏺️ Record");
    
    // Style buttons
    auto styleButton = [](juce::TextButton* btn) {
        btn->setColour(juce::TextButton::buttonColourId, juce::Colour(0xff4d4d4d));
        btn->setColour(juce::TextButton::textColourOffId, juce::Colours::white);
        btn->setColour(juce::TextButton::buttonOnColourId, juce::Colour(0xff007cba));
    };
    
    styleButton(playButton.get());
    styleButton(stopButton.get());
    styleButton(recordButton.get());
    
    // Add button listeners
    playButton->onClick = [this]() {
        isPlaying = !isPlaying;
        playButton->setButtonText(isPlaying ? "⏸️ Pause" : "▶️ Play");
        statusLabel->setText(isPlaying ? "Playing..." : "Stopped", juce::dontSendNotification);
    };
    
    stopButton->onClick = [this]() {
        isPlaying = false;
        playButton->setButtonText("▶️ Play");
        statusLabel->setText("Stopped", juce::dontSendNotification);
    };
    
    recordButton->onClick = [this]() {
        statusLabel->setText("Recording...", juce::dontSendNotification);
    };
    
    addAndMakeVisible(*playButton);
    addAndMakeVisible(*stopButton);
    addAndMakeVisible(*recordButton);
    
    // Create AI processing buttons
    aiMixButton = std::make_unique<juce::TextButton>("🎛️ AI Mixing");
    aiMasterButton = std::make_unique<juce::TextButton>("🎚️ AI Mastering");
    
    // Create Base44 tools button
    auto base44Button = std::make_unique<juce::TextButton>("🌐 Base44 Tools");
    
    styleButton(aiMixButton.get());
    styleButton(aiMasterButton.get());
    styleButton(base44Button.get());
    
    aiMixButton->onClick = [this]() {
        statusLabel->setText("🎛️ AI Mixing Analysis Started...", juce::dontSendNotification);
        
        // Use Base44 client for mixing analysis
        base44Client->requestMixingAnalysis("demo-project", "track1", "demo-file-url", 
            [this](bool success, juce::var result) {
                if (success) {
                    statusLabel->setText("✅ Mixing analysis complete!", juce::dontSendNotification);
                } else {
                    statusLabel->setText("❌ Mixing analysis failed", juce::dontSendNotification);
                }
            });
    };
    
    aiMasterButton->onClick = [this]() {
        statusLabel->setText("🎚️ AI Mastering Started...", juce::dontSendNotification);
        
        // Use Base44 client for mastering
        base44Client->requestMastering("demo-project", "demo-file-url", -14,
            [this](bool success, juce::var result) {
                if (success) {
                    statusLabel->setText("✅ Mastering complete!", juce::dontSendNotification);
                } else {
                    statusLabel->setText("❌ Mastering failed", juce::dontSendNotification);
                }
            });
    };
    
    base44Button->onClick = [this]() {
        statusLabel->setText("🌐 Opening Base44 Tools...", juce::dontSendNotification);
        
        // Launch local web interface
        juce::URL("http://localhost:5173").launchInDefaultBrowser();
        
        // Also show status in DAW
        statusLabel->setText("🌐 Base44 Tools opened in browser", juce::dontSendNotification);
    };
    
    addAndMakeVisible(*aiMixButton);
    addAndMakeVisible(*aiMasterButton);
    addAndMakeVisible(*base44Button);
    
    // Store the button for layout
    base44ToolsButton = std::move(base44Button);
    
    // Create status label
    statusLabel = std::make_unique<juce::Label>("status", "Ready");
    statusLabel->setFont(juce::Font(14.0f));
    statusLabel->setColour(juce::Label::textColourId, juce::Colours::white);
    statusLabel->setJustificationType(juce::Justification::centred);
    addAndMakeVisible(*statusLabel);
    
    setSize(800, 600);
    startTimer(100);
    
    // Set application icon
    SignalForgeIcon::setApplicationIcon();
}

SimpleDAW::~SimpleDAW()
{
    stopTimer();
}

void SimpleDAW::paint(juce::Graphics& g)
{
    // Professional dark background
    g.fillAll(juce::Colour(0xff2d2d2d));
    
    // Draw subtle grid pattern
    g.setColour(juce::Colour(0xff3d3d3d));
    for (int x = 0; x < getWidth(); x += 50)
    {
        g.drawVerticalLine(x, 0.0f, (float)getHeight());
    }
    for (int y = 0; y < getHeight(); y += 50)
    {
        g.drawHorizontalLine(y, 0.0f, (float)getWidth());
    }
    
    // Draw track area placeholder
    g.setColour(juce::Colour(0xff4d4d4d));
    auto trackArea = juce::Rectangle<int>(50, 200, getWidth() - 100, 200);
    g.drawRect(trackArea, 2);
    
    g.setColour(juce::Colours::white);
    g.setFont(juce::Font(16.0f));
    g.drawText("🎵 Track Area", trackArea, juce::Justification::centred);
    
    // Draw mixer area placeholder
    auto mixerArea = juce::Rectangle<int>(50, 420, getWidth() - 100, 100);
    g.drawRect(mixerArea, 2);
    g.drawText("🎛️ Mixer Panel", mixerArea, juce::Justification::centred);
    
    // Draw border
    g.setColour(juce::Colour(0xff007cba));
    g.drawRect(getLocalBounds(), 3);
}

void SimpleDAW::resized()
{
    auto area = getLocalBounds().reduced(20);
    
    // Title at top
    titleLabel->setBounds(area.removeFromTop(50));
    
    area.removeFromTop(20); // Spacing
    
    // Transport controls
    auto transportArea = area.removeFromTop(60);
    auto buttonWidth = 120;
    auto spacing = 20;
    
    auto centerX = transportArea.getCentreX();
    auto startX = centerX - (3 * buttonWidth + 2 * spacing) / 2;
    
    playButton->setBounds(startX, transportArea.getY(), buttonWidth, 50);
    stopButton->setBounds(startX + buttonWidth + spacing, transportArea.getY(), buttonWidth, 50);
    recordButton->setBounds(startX + 2 * (buttonWidth + spacing), transportArea.getY(), buttonWidth, 50);
    
    area.removeFromTop(40); // Spacing for track area
    area.removeFromTop(200); // Track area space
    area.removeFromTop(20); // Spacing
    area.removeFromTop(100); // Mixer area space
    area.removeFromTop(20); // Spacing
    
    // AI processing buttons
    auto aiArea = area.removeFromTop(60);
    auto aiStartX = centerX - (3 * buttonWidth + 2 * spacing) / 2;
    
    aiMixButton->setBounds(aiStartX, aiArea.getY(), buttonWidth, 50);
    aiMasterButton->setBounds(aiStartX + buttonWidth + spacing, aiArea.getY(), buttonWidth, 50);
    base44ToolsButton->setBounds(aiStartX + 2 * (buttonWidth + spacing), aiArea.getY(), buttonWidth, 50);
    
    // Status at bottom
    statusLabel->setBounds(area.removeFromBottom(30));
}

void SimpleDAW::timerCallback()
{
    // Update any real-time displays
    repaint();
}
