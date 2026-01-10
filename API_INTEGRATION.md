###############################################################################
#  SIGNAL FORGE API INTEGRATION DOCUMENTATION
#
#  WARNING – UNAUTHORIZED USE PROHIBITED
#
#  This document contains proprietary Signal Forge API information.
#
#  © Signal Forge. All rights reserved.
###############################################################################

# SignalForge API Integration

## Overview
Complete API integration for connecting your SignalForge DAW to the Base44 backend.

## Components Added

### 1. Base44Client (`Core/API/Base44Client.h/cpp`)
- HTTP client for all API communication
- Handles authentication, projects, file uploads, and AI processing
- Async callbacks for all operations

### 2. TokenManager (`Core/Auth/TokenManager.h/cpp`)
- Cross-platform secure token storage
- Windows: Credential Manager
- macOS: Keychain
- Linux: Encrypted file storage

### 3. ProtocolHandler (`Core/Auth/ProtocolHandler.h/cpp`)
- Handles `signalforge://auth?token=...` URL callbacks
- Registers protocol on all platforms
- Extracts and stores authentication tokens

### 4. APIManager (`Core/API/APIManager.h/cpp`)
- High-level API management singleton
- Handles authentication flow
- Manages AI processing operations with polling
- Provides callbacks for UI updates

## Usage Examples

### Authentication
```cpp
auto& api = APIManager::getInstance();

// Set up callbacks
api.onAuthStateChanged = [](bool authenticated) {
    if (authenticated) {
        DBG("User logged in successfully");
    }
};

// Initiate login (opens browser)
api.initiateLogin();
```

### Create Project
```cpp
api.createProject("My Song", 48000, 24, [](bool success, String projectId) {
    if (success) {
        DBG("Project created: " + projectId);
    }
});
```

### AI Processing
```cpp
File audioFile = File("/path/to/audio.wav");

// Mixing analysis
api.processMixing(projectId, audioFile, [](bool success, var result) {
    if (success) {
        DBG("Mixing analysis started");
    }
});

// Mastering
api.processMastering(projectId, audioFile, [](bool success, var result) {
    if (success) {
        DBG("Mastering started");
    }
});

// Stem separation
api.processStemSeparation(projectId, audioFile, [](bool success, var result) {
    if (success) {
        DBG("Stem separation started");
    }
});
```

### Handle Results
```cpp
api.onProcessingComplete = [](const String& type, var result) {
    if (type == "mixing") {
        // Handle mixing suggestions
    } else if (type == "mastering") {
        String processedUrl = result["processed_file_url"].toString();
        // Download and load mastered file
    } else if (type == "stems") {
        var stems = result["stems"];
        // Load separated stems
    }
};
```

## Build Configuration

The CMakeLists.txt has been updated to include:
- All new source files
- Required libraries (CURL, platform-specific security libs)
- Cross-platform networking support

## Protocol Registration

### Windows
Add to installer or run as admin:
```
HKEY_CLASSES_ROOT\signalforge
  (Default) = "URL:SignalForge Protocol"
  URL Protocol = ""
  shell\open\command
    (Default) = "\"C:\Path\To\SignalForge.exe\" \"%1\""
```

### macOS
Already configured in Info.plist.in

### Linux
Automatically creates .desktop file on first run

## Next Steps

1. **Test Authentication**: Run the app and test the login flow with https://signal-forge.online
2. **Test Authentication**: Run the app and test the login flow
3. **Add UI Elements**: Create login/logout buttons, processing status indicators
4. **Handle File Downloads**: Implement downloading of processed audio files
5. **Error Handling**: Add proper error handling and user feedback

## Security Notes

- Tokens are stored securely using platform-specific credential managers
- All API communication uses HTTPS
- No sensitive data is logged or stored in plain text
