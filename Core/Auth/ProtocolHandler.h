#pragma once
#include <JuceHeader.h>

class ProtocolHandler {
public:
    static void registerProtocol();
    static void handleAuthCallback(const String& url);
    
    // Callback for when authentication is completed
    static std::function<void(const String& token)> onAuthComplete;
    
private:
    static void openBrowserForAuth();
    static String extractTokenFromUrl(const String& url);
    
#if JUCE_WINDOWS
    static void registerProtocolWindows();
#elif JUCE_MAC
    static void registerProtocolMac();
#elif JUCE_LINUX
    static void registerProtocolLinux();
#endif
};
