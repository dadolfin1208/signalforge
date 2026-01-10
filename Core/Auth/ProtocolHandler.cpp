#include "ProtocolHandler.h"
#include "TokenManager.h"

std::function<void(const String& token)> ProtocolHandler::onAuthComplete = nullptr;

void ProtocolHandler::registerProtocol() {
#if JUCE_WINDOWS
    registerProtocolWindows();
#elif JUCE_MAC
    registerProtocolMac();
#elif JUCE_LINUX
    registerProtocolLinux();
#endif
}

void ProtocolHandler::handleAuthCallback(const String& url) {
    String token = extractTokenFromUrl(url);
    
    if (token.isNotEmpty()) {
        TokenManager::storeToken(token);
        
        if (onAuthComplete) {
            onAuthComplete(token);
        }
    }
}

void ProtocolHandler::openBrowserForAuth() {
    String authUrl = "https://signal-forge.online/auth/login";
    URL(authUrl).launchInDefaultBrowser();
}

String ProtocolHandler::extractTokenFromUrl(const String& url) {
    URL parsedUrl(url);
    StringArray params = parsedUrl.getParameterNames();
    StringArray values = parsedUrl.getParameterValues();
    
    for (int i = 0; i < params.size(); ++i) {
        if (params[i] == "token") {
            return values[i];
        }
    }
    
    return String();
}

#if JUCE_WINDOWS
void ProtocolHandler::registerProtocolWindows() {
    // This would typically be done by the installer
    // For runtime registration (requires admin rights):
    /*
    HKEY hKey;
    LONG result = RegCreateKeyExA(HKEY_CLASSES_ROOT, "signalforge", 0, NULL, 
                                  REG_OPTION_NON_VOLATILE, KEY_WRITE, NULL, &hKey, NULL);
    
    if (result == ERROR_SUCCESS) {
        RegSetValueExA(hKey, "", 0, REG_SZ, (BYTE*)"URL:SignalForge Protocol", 26);
        RegSetValueExA(hKey, "URL Protocol", 0, REG_SZ, (BYTE*)"", 1);
        RegCloseKey(hKey);
        
        // Set command
        RegCreateKeyExA(HKEY_CLASSES_ROOT, "signalforge\\shell\\open\\command", 0, NULL,
                        REG_OPTION_NON_VOLATILE, KEY_WRITE, NULL, &hKey, NULL);
        
        String exePath = File::getSpecialLocation(File::currentExecutableFile).getFullPathName();
        String command = "\"" + exePath + "\" \"%1\"";
        RegSetValueExA(hKey, "", 0, REG_SZ, (BYTE*)command.toUTF8().getAddress(), command.length());
        RegCloseKey(hKey);
    }
    */
}
#endif

#if JUCE_MAC
void ProtocolHandler::registerProtocolMac() {
    // Protocol registration is handled by Info.plist
    // This is just a placeholder for any runtime setup needed
}
#endif

#if JUCE_LINUX
void ProtocolHandler::registerProtocolLinux() {
    auto homeDir = File::getSpecialLocation(File::userHomeDirectory);
    auto desktopFile = homeDir.getChildFile(".local/share/applications/signalforge.desktop");
    
    String exePath = File::getSpecialLocation(File::currentExecutableFile).getFullPathName();
    
    String desktopContent = 
        "[Desktop Entry]\n"
        "Type=Application\n"
        "Name=SignalForge\n"
        "Exec=" + exePath + " %u\n"
        "MimeType=x-scheme-handler/signalforge;\n"
        "NoDisplay=true\n";
    
    desktopFile.replaceWithText(desktopContent);
    
    // Update MIME database
    system("update-desktop-database ~/.local/share/applications/");
}
#endif
