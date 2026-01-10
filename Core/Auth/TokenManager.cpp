#include "TokenManager.h"

#if JUCE_WINDOWS
#include <windows.h>
#include <wincred.h>
#elif JUCE_MAC
#include <Security/Security.h>
#elif JUCE_LINUX
#include <fstream>
#include <sys/stat.h>
#endif

String TokenManager::getKeychainService() {
    return "SignalForge";
}

String TokenManager::getKeychainAccount() {
    return "auth_token";
}

bool TokenManager::storeToken(const String& token) {
#if JUCE_WINDOWS
    return storeTokenWindows(token);
#elif JUCE_MAC
    return storeTokenMac(token);
#elif JUCE_LINUX
    return storeTokenLinux(token);
#else
    return false;
#endif
}

String TokenManager::getStoredToken() {
#if JUCE_WINDOWS
    return getTokenWindows();
#elif JUCE_MAC
    return getTokenMac();
#elif JUCE_LINUX
    return getTokenLinux();
#else
    return String();
#endif
}

void TokenManager::clearToken() {
#if JUCE_WINDOWS
    clearTokenWindows();
#elif JUCE_MAC
    clearTokenMac();
#elif JUCE_LINUX
    clearTokenLinux();
#endif
}

bool TokenManager::hasValidToken() {
    return getStoredToken().isNotEmpty();
}

#if JUCE_WINDOWS
bool TokenManager::storeTokenWindows(const String& token) {
    CREDENTIAL cred = {};
    auto serviceName = getKeychainService().toWideCharPointer();
    auto tokenData = token.toUTF8();
    
    cred.Type = CRED_TYPE_GENERIC;
    cred.TargetName = serviceName;
    cred.CredentialBlobSize = (DWORD)tokenData.length();
    cred.CredentialBlob = (LPBYTE)tokenData.getAddress();
    cred.Persist = CRED_PERSIST_LOCAL_MACHINE;
    
    return CredWriteW(&cred, 0) == TRUE;
}

String TokenManager::getTokenWindows() {
    PCREDENTIALW pcred;
    auto serviceName = getKeychainService().toWideCharPointer();
    
    if (CredReadW(serviceName, CRED_TYPE_GENERIC, 0, &pcred) == TRUE) {
        String token = String::fromUTF8((char*)pcred->CredentialBlob, pcred->CredentialBlobSize);
        CredFree(pcred);
        return token;
    }
    return String();
}

void TokenManager::clearTokenWindows() {
    auto serviceName = getKeychainService().toWideCharPointer();
    CredDeleteW(serviceName, CRED_TYPE_GENERIC, 0);
}
#endif

#if JUCE_MAC
bool TokenManager::storeTokenMac(const String& token) {
    auto service = getKeychainService().toUTF8();
    auto account = getKeychainAccount().toUTF8();
    auto tokenData = token.toUTF8();
    
    // Delete existing item first
    SecKeychainItemRef itemRef = nullptr;
    OSStatus findStatus = SecKeychainFindGenericPassword(
        nullptr, (UInt32)service.length(), service.getAddress(),
        (UInt32)account.length(), account.getAddress(),
        nullptr, nullptr, &itemRef
    );
    
    if (findStatus == errSecSuccess && itemRef) {
        SecKeychainItemDelete(itemRef);
        CFRelease(itemRef);
    }
    
    // Add new item
    OSStatus status = SecKeychainAddGenericPassword(
        nullptr, (UInt32)service.length(), service.getAddress(),
        (UInt32)account.length(), account.getAddress(),
        (UInt32)tokenData.length(), tokenData.getAddress(), nullptr
    );
    
    return status == errSecSuccess;
}

String TokenManager::getTokenMac() {
    auto service = getKeychainService().toUTF8();
    auto account = getKeychainAccount().toUTF8();
    
    UInt32 passwordLength = 0;
    void* passwordData = nullptr;
    
    OSStatus status = SecKeychainFindGenericPassword(
        nullptr, (UInt32)service.length(), service.getAddress(),
        (UInt32)account.length(), account.getAddress(),
        &passwordLength, &passwordData, nullptr
    );
    
    if (status == errSecSuccess && passwordData) {
        String token = String::fromUTF8((char*)passwordData, passwordLength);
        SecKeychainItemFreeContent(nullptr, passwordData);
        return token;
    }
    
    return String();
}

void TokenManager::clearTokenMac() {
    auto service = getKeychainService().toUTF8();
    auto account = getKeychainAccount().toUTF8();
    
    SecKeychainItemRef itemRef = nullptr;
    OSStatus status = SecKeychainFindGenericPassword(
        nullptr, (UInt32)service.length(), service.getAddress(),
        (UInt32)account.length(), account.getAddress(),
        nullptr, nullptr, &itemRef
    );
    
    if (status == errSecSuccess && itemRef) {
        SecKeychainItemDelete(itemRef);
        CFRelease(itemRef);
    }
}
#endif

#if JUCE_LINUX
bool TokenManager::storeTokenLinux(const String& token) {
    auto homeDir = File::getSpecialLocation(File::userHomeDirectory);
    auto configDir = homeDir.getChildFile(".config/signalforge");
    
    if (!configDir.exists()) {
        configDir.createDirectory();
        configDir.setReadOnly(false, false);
    }
    
    auto tokenFile = configDir.getChildFile("auth_token");
    return tokenFile.replaceWithText(token);
}

String TokenManager::getTokenLinux() {
    auto homeDir = File::getSpecialLocation(File::userHomeDirectory);
    auto tokenFile = homeDir.getChildFile(".config/signalforge/auth_token");
    
    if (tokenFile.exists()) {
        return tokenFile.loadFileAsString();
    }
    
    return String();
}

void TokenManager::clearTokenLinux() {
    auto homeDir = File::getSpecialLocation(File::userHomeDirectory);
    auto tokenFile = homeDir.getChildFile(".config/signalforge/auth_token");
    
    if (tokenFile.exists()) {
        tokenFile.deleteFile();
    }
}
#endif
