#include "SignalForgeIcon.h"

juce::Image SignalForgeIcon::getIcon(int size)
{
    return createIconImage(size);
}

void SignalForgeIcon::setApplicationIcon()
{
    // Create the icon - actual window icon setting is handled by the OS
    auto icon = getIcon(64);
}

juce::Image SignalForgeIcon::createIconImage(int size)
{
    juce::Image icon(juce::Image::ARGB, size, size, true);
    juce::Graphics g(icon);
    
    // Draw background circle
    g.setColour(juce::Colour(0xff007cba)); // Signal Forge blue
    g.fillEllipse(2, 2, size - 4, size - 4);
    
    // Draw border
    g.setColour(juce::Colours::white);
    g.drawEllipse(2, 2, size - 4, size - 4, 2);
    
    // Draw musical note
    float scale = size / 64.0f;
    
    // Note stem
    g.fillRect(juce::Rectangle<float>(30 * scale, 15 * scale, 4 * scale, 35 * scale));
    
    // Note head
    g.fillEllipse(22 * scale, 42 * scale, 12 * scale, 8 * scale);
    
    // Note flag
    juce::Path flag;
    flag.startNewSubPath(34 * scale, 15 * scale);
    flag.quadraticTo(45 * scale, 18 * scale, 45 * scale, 25 * scale);
    flag.quadraticTo(45 * scale, 32 * scale, 34 * scale, 30 * scale);
    flag.closeSubPath();
    g.fillPath(flag);
    
    // Draw staff lines
    g.setColour(juce::Colours::white.withAlpha(0.7f));
    for (int i = 0; i < 3; ++i)
    {
        float y = (35 + i * 4) * scale;
        g.drawHorizontalLine((int)y, 10 * scale, 50 * scale);
    }
    
    return icon;
}
