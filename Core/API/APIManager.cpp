#include "APIManager.h"
#include "../Auth/TokenManager.h"
#include "../Auth/ProtocolHandler.h"

APIManager::APIManager() : authenticated(false) {
    client = std::make_unique<Base44Client>("https://signal-forge-8c2d5f19.base44.app");
    
    // Set up auth callback
    ProtocolHandler::onAuthComplete = [this](const String& token) {
        handleAuthComplete(token);
    };
    
    // Check for existing token
    String existingToken = TokenManager::getStoredToken();
    if (existingToken.isNotEmpty()) {
        client->setToken(existingToken);
        
        // Verify token is still valid
        client->authenticate([this](bool success, String user) {
            authenticated = success;
            if (success) {
                currentUser = user;
            }
            if (onAuthStateChanged) {
                onAuthStateChanged(success);
            }
        });
    }
}

APIManager::~APIManager() {
    stopPolling();
}

APIManager& APIManager::getInstance() {
    static APIManager instance;
    return instance;
}

void APIManager::initiateLogin() {
    String authUrl = "https://signal-forge.online/auth/login";
    URL(authUrl).launchInDefaultBrowser();
}

void APIManager::logout() {
    TokenManager::clearToken();
    authenticated = false;
    currentUser = "";
    client->setToken("");
    
    if (onAuthStateChanged) {
        onAuthStateChanged(false);
    }
}

bool APIManager::isLoggedIn() {
    return authenticated;
}

String APIManager::getCurrentUser() {
    return currentUser;
}

void APIManager::createProject(const String& name, int sampleRate, int bitDepth, 
                              std::function<void(bool, String)> callback) {
    if (!authenticated) {
        callback(false, "");
        return;
    }
    
    var projectData;
    projectData.getDynamicObject()->setProperty("name", name);
    projectData.getDynamicObject()->setProperty("sample_rate", String(sampleRate));
    projectData.getDynamicObject()->setProperty("bit_depth", String(bitDepth));
    projectData.getDynamicObject()->setProperty("tempo", 120);
    projectData.getDynamicObject()->setProperty("tracks_count", 8);
    
    client->createProject(projectData, [callback](bool success, var response) {
        if (success && response.hasProperty("id")) {
            callback(true, response["id"].toString());
        } else {
            callback(false, "");
        }
    });
}

void APIManager::syncProject(const String& projectId, const var& projectData) {
    if (!authenticated) return;
    
    client->updateProject(projectId, projectData, [](bool success, var response) {
        // Handle sync result if needed
    });
}

void APIManager::processMixing(const String& projectId, const File& audioFile, 
                              std::function<void(bool, var)> callback) {
    if (!authenticated) {
        callback(false, var());
        return;
    }
    
    // Upload file first
    client->uploadFile(audioFile, [this, projectId, audioFile, callback](bool success, String fileUrl) {
        if (!success) {
            callback(false, var());
            return;
        }
        
        // Request mixing analysis
        client->requestMixingAnalysis(projectId, audioFile.getFileNameWithoutExtension(), 
                                     fileUrl, [this, projectId, callback](bool success, var response) {
            if (success) {
                // Add to pending operations for polling
                PendingOperation op;
                op.type = "mixing";
                op.projectId = projectId;
                op.startTime = Time::getCurrentTime();
                pendingOperations.add(op);
                
                startPolling();
                callback(true, response);
            } else {
                callback(false, var());
            }
        });
    });
}

void APIManager::processMastering(const String& projectId, const File& audioFile, 
                                 std::function<void(bool, var)> callback) {
    if (!authenticated) {
        callback(false, var());
        return;
    }
    
    client->uploadFile(audioFile, [this, projectId, callback](bool success, String fileUrl) {
        if (!success) {
            callback(false, var());
            return;
        }
        
        client->requestMastering(projectId, fileUrl, -14, [this, projectId, callback](bool success, var response) {
            if (success) {
                PendingOperation op;
                op.type = "mastering";
                op.projectId = projectId;
                op.startTime = Time::getCurrentTime();
                pendingOperations.add(op);
                
                startPolling();
                callback(true, response);
            } else {
                callback(false, var());
            }
        });
    });
}

void APIManager::processStemSeparation(const String& projectId, const File& audioFile, 
                                      std::function<void(bool, var)> callback) {
    if (!authenticated) {
        callback(false, var());
        return;
    }
    
    client->uploadFile(audioFile, [this, projectId, callback](bool success, String fileUrl) {
        if (!success) {
            callback(false, var());
            return;
        }
        
        client->requestStemSeparation(projectId, fileUrl, [this, projectId, callback](bool success, var response) {
            if (success) {
                PendingOperation op;
                op.type = "stems";
                op.projectId = projectId;
                op.startTime = Time::getCurrentTime();
                pendingOperations.add(op);
                
                startPolling();
                callback(true, response);
            } else {
                callback(false, var());
            }
        });
    });
}

void APIManager::startPolling() {
    if (!isTimerRunning()) {
        startTimer(3000); // Poll every 3 seconds
    }
}

void APIManager::stopPolling() {
    stopTimer();
}

void APIManager::timerCallback() {
    checkPendingOperations();
    
    if (pendingOperations.isEmpty()) {
        stopPolling();
    }
}

void APIManager::handleAuthComplete(const String& token) {
    client->setToken(token);
    
    client->authenticate([this](bool success, String user) {
        authenticated = success;
        if (success) {
            currentUser = user;
        }
        
        if (onAuthStateChanged) {
            onAuthStateChanged(success);
        }
    });
}

void APIManager::checkPendingOperations() {
    for (int i = pendingOperations.size() - 1; i >= 0; --i) {
        pollOperation(pendingOperations[i]);
    }
}

void APIManager::pollOperation(const PendingOperation& op) {
    auto callback = [this, op](bool success, var response) {
        if (success && response.isArray() && response.size() > 0) {
            var result = response[0];
            
            if (result.hasProperty("status")) {
                String status = result["status"].toString();
                
                if (status == "completed") {
                    // Remove from pending operations
                    for (int i = 0; i < pendingOperations.size(); ++i) {
                        if (pendingOperations[i].projectId == op.projectId && 
                            pendingOperations[i].type == op.type) {
                            pendingOperations.remove(i);
                            break;
                        }
                    }
                    
                    // Notify completion
                    if (onProcessingComplete) {
                        onProcessingComplete(op.type, result);
                    }
                }
            }
        }
    };
    
    if (op.type == "mixing") {
        client->getMixingResults(op.projectId, callback);
    } else if (op.type == "mastering") {
        client->getMasteringResults(op.projectId, callback);
    } else if (op.type == "stems") {
        client->getStemResults(op.projectId, callback);
    }
}
