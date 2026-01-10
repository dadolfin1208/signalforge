#pragma once
#include <JuceHeader.h>

class TokenManager {
public:
    static bool storeToken(const String& token);
    static String getStoredToken();
    static void clearToken();
    static bool hasValidToken();

private:
    static String getKeychainService();
    static String getKeychainAccount();
    
#if JUCE_WINDOWS
    static bool storeTokenWindows(const String& token);
    static String getTokenWindows();
    static void clearTokenWindows();
#elif JUCE_MAC
    static bool storeTokenMac(const String& token);
    static String getTokenMac();
    static void clearTokenMac();
#elif JUCE_LINUX
    static bool storeTokenLinux(const String& token);
    static String getTokenLinux();
    static void clearTokenLinux();
#endif
};
