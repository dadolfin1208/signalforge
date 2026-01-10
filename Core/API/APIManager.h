#pragma once
#include <JuceHeader.h>
#include "../API/Base44Client.h"

class APIManager : public Timer {
public:
    APIManager();
    ~APIManager();
    
    // Singleton access
    static APIManager& getInstance();
    
    // Authentication
    void initiateLogin();
    void logout();
    bool isLoggedIn();
    String getCurrentUser();
    
    // Project management
    void createProject(const String& name, int sampleRate, int bitDepth, 
                      std::function<void(bool, String)> callback);
    void syncProject(const String& projectId, const var& projectData);
    
    // AI Processing
    void processMixing(const String& projectId, const File& audioFile, 
                      std::function<void(bool, var)> callback);
    void processMastering(const String& projectId, const File& audioFile, 
                         std::function<void(bool, var)> callback);
    void processStemSeparation(const String& projectId, const File& audioFile, 
                              std::function<void(bool, var)> callback);
    
    // Status polling
    void startPolling();
    void stopPolling();
    void timerCallback() override;
    
    // Callbacks
    std::function<void(bool)> onAuthStateChanged;
    std::function<void(const String&, var)> onProcessingComplete;

private:
    std::unique_ptr<Base44Client> client;
    String currentUser;
    bool authenticated;
    
    struct PendingOperation {
        String type;
        String projectId;
        Time startTime;
    };
    
    Array<PendingOperation> pendingOperations;
    
    void handleAuthComplete(const String& token);
    void checkPendingOperations();
    void pollOperation(const PendingOperation& op);
};
