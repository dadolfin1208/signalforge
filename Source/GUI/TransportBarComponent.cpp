#include "TransportBarComponent.h"

TransportBarComponent::TransportBarComponent()
    : isPlaying(false), isRecording(false), isLooping(false), currentTime(0.0), bpm(120.0)
{
    // Create transport buttons with icons
    playButton = std::make_unique<juce::TextButton>("▶️");
    stopButton = std::make_unique<juce::TextButton>("⏹️");
    recordButton = std::make_unique<juce::TextButton>("⏺️");
    rewindButton = std::make_unique<juce::TextButton>("⏪");
    fastForwardButton = std::make_unique<juce::TextButton>("⏩");
    loopButton = std::make_unique<juce::TextButton>("🔄");
    
    // Style transport buttons
    auto styleButton = [](juce::TextButton* btn) {
        btn->setColour(juce::TextButton::buttonColourId, juce::Colour(0xff4d4d4d));
        btn->setColour(juce::TextButton::textColourOffId, juce::Colours::white);
        btn->setColour(juce::TextButton::buttonOnColourId, juce::Colour(0xff007cba));
    };
    
    styleButton(playButton.get());
    styleButton(stopButton.get());
    styleButton(recordButton.get());
    styleButton(rewindButton.get());
    styleButton(fastForwardButton.get());
    styleButton(loopButton.get());
    
    // Set button properties
    recordButton->setColour(juce::TextButton::buttonOnColourId, juce::Colours::red);
    loopButton->setClickingTogglesState(true);
    
    // Add listeners
    playButton->addListener(this);
    stopButton->addListener(this);
    recordButton->addListener(this);
    rewindButton->addListener(this);
    fastForwardButton->addListener(this);
    loopButton->addListener(this);
    
    // Create time display
    timeDisplay = std::make_unique<juce::Label>("time", "00:00:000");
    timeDisplay->setFont(juce::Font(18.0f));
    timeDisplay->setColour(juce::Label::textColourId, juce::Colours::white);
    timeDisplay->setJustificationType(juce::Justification::centred);
    
    // Create tempo controls
    tempoSlider = std::make_unique<juce::Slider>(juce::Slider::LinearHorizontal, juce::Slider::TextBoxRight);
    tempoSlider->setRange(60.0, 200.0, 0.1);
    tempoSlider->setValue(120.0);
    tempoSlider->setColour(juce::Slider::thumbColourId, juce::Colour(0xff007cba));
    
    tempoDisplay = std::make_unique<juce::Label>("tempo", "BPM");
    tempoDisplay->setColour(juce::Label::textColourId, juce::Colours::white);
    
    // Create time signature
    timeSignature = std::make_unique<juce::ComboBox>();
    timeSignature->addItem("4/4", 1);
    timeSignature->addItem("3/4", 2);
    timeSignature->addItem("2/4", 3);
    timeSignature->addItem("6/8", 4);
    timeSignature->setSelectedId(1);
    
    // Create master volume
    masterVolume = std::make_unique<juce::Slider>(juce::Slider::LinearVertical, juce::Slider::NoTextBox);
    masterVolume->setRange(0.0, 1.0, 0.01);
    masterVolume->setValue(0.8);
    masterVolume->setColour(juce::Slider::thumbColourId, juce::Colour(0xff007cba));
    
    masterVolumeLabel = std::make_unique<juce::Label>("master", "MASTER");
    masterVolumeLabel->setColour(juce::Label::textColourId, juce::Colours::white);
    masterVolumeLabel->setJustificationType(juce::Justification::centred);
    
    // Create AI processing buttons
    aiMixingButton = std::make_unique<juce::TextButton>("🎛️ AI Mix");
    aiMasteringButton = std::make_unique<juce::TextButton>("🎚️ AI Master");
    
    aiMixingButton->setColour(juce::TextButton::buttonColourId, juce::Colour(0xff4d4d4d));
    aiMasteringButton->setColour(juce::TextButton::buttonColourId, juce::Colour(0xff4d4d4d));
    aiMixingButton->setColour(juce::TextButton::textColourOffId, juce::Colours::white);
    aiMasteringButton->setColour(juce::TextButton::textColourOffId, juce::Colours::white);
    
    aiMixingButton->addListener(this);
    aiMasteringButton->addListener(this);
    
    // Add all components
    addAndMakeVisible(*playButton);
    addAndMakeVisible(*stopButton);
    addAndMakeVisible(*recordButton);
    addAndMakeVisible(*rewindButton);
    addAndMakeVisible(*fastForwardButton);
    addAndMakeVisible(*loopButton);
    addAndMakeVisible(*timeDisplay);
    addAndMakeVisible(*tempoSlider);
    addAndMakeVisible(*tempoDisplay);
    addAndMakeVisible(*timeSignature);
    addAndMakeVisible(*masterVolume);
    addAndMakeVisible(*masterVolumeLabel);
    addAndMakeVisible(*aiMixingButton);
    addAndMakeVisible(*aiMasteringButton);
    
    // Start timer for time updates
    startTimer(100); // 10 FPS
}

TransportBarComponent::~TransportBarComponent()
{
    stopTimer();
}

void TransportBarComponent::paint(juce::Graphics& g)
{
    // Dark transport bar background
    g.fillAll(juce::Colour(0xff3d3d3d));
    
    // Draw separator lines
    g.setColour(juce::Colour(0xff5d5d5d));
    g.drawHorizontalLine(0, 0.0f, (float)getWidth());
    g.drawHorizontalLine(getHeight() - 1, 0.0f, (float)getWidth());
    
    // Draw section dividers
    g.drawVerticalLine(200, 5.0f, (float)getHeight() - 5);
    g.drawVerticalLine(400, 5.0f, (float)getHeight() - 5);
    g.drawVerticalLine(getWidth() - 200, 5.0f, (float)getHeight() - 5);
}

void TransportBarComponent::resized()
{
    auto area = getLocalBounds().reduced(5);
    
    // Transport controls (left side)
    auto transportArea = area.removeFromLeft(190);
    auto buttonWidth = 30;
    auto buttonHeight = 30;
    auto buttonY = (transportArea.getHeight() - buttonHeight) / 2;
    
    rewindButton->setBounds(transportArea.removeFromLeft(buttonWidth).withY(buttonY).withHeight(buttonHeight));
    playButton->setBounds(transportArea.removeFromLeft(buttonWidth).withY(buttonY).withHeight(buttonHeight));
    stopButton->setBounds(transportArea.removeFromLeft(buttonWidth).withY(buttonY).withHeight(buttonHeight));
    recordButton->setBounds(transportArea.removeFromLeft(buttonWidth).withY(buttonY).withHeight(buttonHeight));
    fastForwardButton->setBounds(transportArea.removeFromLeft(buttonWidth).withY(buttonY).withHeight(buttonHeight));
    loopButton->setBounds(transportArea.removeFromLeft(buttonWidth).withY(buttonY).withHeight(buttonHeight));
    
    // Time display (center-left)
    auto timeArea = area.removeFromLeft(200);
    timeDisplay->setBounds(timeArea.removeFromTop(30).withY(buttonY));
    
    // Tempo and time signature (center)
    auto tempoArea = area.removeFromLeft(200);
    auto tempoTop = tempoArea.removeFromTop(25);
    tempoDisplay->setBounds(tempoTop.removeFromLeft(40));
    tempoSlider->setBounds(tempoTop.removeFromLeft(120));
    timeSignature->setBounds(tempoTop.removeFromLeft(40));
    
    // AI processing buttons (center-right)
    auto aiArea = area.removeFromLeft(200);
    aiMixingButton->setBounds(aiArea.removeFromTop(25).reduced(2));
    aiMasteringButton->setBounds(aiArea.removeFromTop(25).reduced(2));
    
    // Master volume (right side)
    auto masterArea = area.removeFromRight(60);
    masterVolumeLabel->setBounds(masterArea.removeFromBottom(20));
    masterVolume->setBounds(masterArea.reduced(10, 5));
}

void TransportBarComponent::buttonClicked(juce::Button* button)
{
    if (button == playButton.get())
    {
        isPlaying = !isPlaying;
        playButton->setButtonText(isPlaying ? "⏸️" : "▶️");
        playButton->setToggleState(isPlaying, juce::dontSendNotification);
    }
    else if (button == stopButton.get())
    {
        isPlaying = false;
        isRecording = false;
        currentTime = 0.0;
        playButton->setButtonText("▶️");
        playButton->setToggleState(false, juce::dontSendNotification);
        recordButton->setToggleState(false, juce::dontSendNotification);
    }
    else if (button == recordButton.get())
    {
        isRecording = !isRecording;
        recordButton->setToggleState(isRecording, juce::dontSendNotification);
        if (isRecording && !isPlaying)
        {
            isPlaying = true;
            playButton->setButtonText("⏸️");
            playButton->setToggleState(true, juce::dontSendNotification);
        }
    }
    else if (button == loopButton.get())
    {
        isLooping = loopButton->getToggleState();
    }
    else if (button == aiMixingButton.get())
    {
        // TODO: Launch AI mixing analysis
        juce::AlertWindow::showMessageBox(
            juce::AlertWindow::InfoIcon,
            "AI Mixing",
            "🎛️ AI Mixing Analysis will be launched here.\n\nThis feature connects to the Base44 backend for intelligent mixing suggestions."
        );
    }
    else if (button == aiMasteringButton.get())
    {
        // TODO: Launch AI mastering
        juce::AlertWindow::showMessageBox(
            juce::AlertWindow::InfoIcon,
            "AI Mastering",
            "🎚️ AI Mastering will be launched here.\n\nThis feature provides professional mastering using AI algorithms."
        );
    }
}

void TransportBarComponent::timerCallback()
{
    if (isPlaying)
    {
        currentTime += 0.1; // Increment by 100ms
        
        // Update time display
        int minutes = (int)(currentTime / 60.0);
        int seconds = (int)currentTime % 60;
        int milliseconds = (int)((currentTime - (int)currentTime) * 1000);
        
        juce::String timeString = juce::String::formatted("%02d:%02d:%03d", minutes, seconds, milliseconds);
        timeDisplay->setText(timeString, juce::dontSendNotification);
    }
    
    // Update BPM from slider
    bpm = tempoSlider->getValue();
}
