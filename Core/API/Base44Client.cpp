#include "Base44Client.h"
#include <JuceHeader.h>

Base44Client::Base44Client(const String& baseUrl) : baseUrl(baseUrl), authToken(""), appId("") {}

void Base44Client::setToken(const String& token) {
    authToken = token;
}

void Base44Client::setAppId(const String& appId) {
    this->appId = appId;
}

void Base44Client::initialize() {
    // Set your app ID from the frontend
    setAppId("6961194a8a60eaa48c2d5f19");
}

bool Base44Client::isAuthenticated() {
    return authToken.isNotEmpty();
}

void Base44Client::authenticate(std::function<void(bool, String)> callback) {
    makeRequest("/auth/me", "GET", var(), [callback](bool success, var response) {
        if (success && response.hasProperty("email")) {
            callback(true, response["email"].toString());
        } else {
            callback(false, "Authentication failed");
        }
    });
}

void Base44Client::createProject(const var& projectData, std::function<void(bool, var)> callback) {
    makeRequest("/entities/Project", "POST", projectData, callback);
}

void Base44Client::updateProject(const String& projectId, const var& updateData, std::function<void(bool, var)> callback) {
    makeRequest("/entities/Project/" + projectId, "PUT", updateData, callback);
}

void Base44Client::listProjects(std::function<void(bool, var)> callback) {
    makeRequest("/entities/Project", "GET", var(), callback);
}

void Base44Client::uploadFile(const File& audioFile, std::function<void(bool, String)> callback) {
    if (!audioFile.exists()) {
        callback(false, "");
        return;
    }
    
    // For now, return a mock URL - implement actual upload later
    callback(true, "https://signal-forge-8c2d5f19.base44.app/uploads/" + audioFile.getFileName());
}

void Base44Client::requestMixingAnalysis(const String& projectId, const String& trackName, 
                                        const String& fileUrl, std::function<void(bool, var)> callback) {
    var params;
    params.getDynamicObject()->setProperty("project_id", projectId);
    params.getDynamicObject()->setProperty("track_name", trackName);
    params.getDynamicObject()->setProperty("stem_type", "vocals");
    params.getDynamicObject()->setProperty("analysis_type", "single_track");
    params.getDynamicObject()->setProperty("file_url", fileUrl);
    
    makeRequest("/functions/analyzeMixing", "POST", params, callback);
}

void Base44Client::getMixingResults(const String& projectId, std::function<void(bool, var)> callback) {
    makeRequest("/entities/MixingAnalysis?project_id=" + projectId, "GET", var(), callback);
}

void Base44Client::requestMastering(const String& projectId, const String& fileUrl, 
                                   int targetLufs, std::function<void(bool, var)> callback) {
    var params;
    params.getDynamicObject()->setProperty("project_id", projectId);
    params.getDynamicObject()->setProperty("track_name", "Final Mix");
    params.getDynamicObject()->setProperty("mastering_type", "full_mix");
    params.getDynamicObject()->setProperty("target_lufs", targetLufs);
    params.getDynamicObject()->setProperty("file_url", fileUrl);
    
    makeRequest("/functions/analyzeMastering", "POST", params, callback);
}

void Base44Client::getMasteringResults(const String& projectId, std::function<void(bool, var)> callback) {
    makeRequest("/entities/MasteringAnalysis?project_id=" + projectId, "GET", var(), callback);
}

void Base44Client::requestStemSeparation(const String& projectId, const String& fileUrl, 
                                        std::function<void(bool, var)> callback) {
    var params;
    params.getDynamicObject()->setProperty("project_id", projectId);
    params.getDynamicObject()->setProperty("track_name", "Full Mix");
    params.getDynamicObject()->setProperty("source_file_url", fileUrl);
    
    makeRequest("/functions/separateStems", "POST", params, callback);
}

void Base44Client::getStemResults(const String& projectId, std::function<void(bool, var)> callback) {
    makeRequest("/entities/StemSeparation?project_id=" + projectId, "GET", var(), callback);
}

void Base44Client::makeRequest(const String& endpoint, const String& method, 
                              const var& data, std::function<void(bool, var)> callback) {
    // Stub implementation - replace with actual HTTP client later
    DBG("API Request: " + method + " " + endpoint);
    
    // Mock successful response
    var mockResponse;
    if (endpoint.contains("/auth/me")) {
        mockResponse.getDynamicObject()->setProperty("email", "user@example.com");
    } else if (endpoint.contains("/entities/Project")) {
        mockResponse.getDynamicObject()->setProperty("id", "project-123");
        mockResponse.getDynamicObject()->setProperty("name", "Test Project");
    }
    
    // Simulate async callback
    Timer::callAfterDelay(100, [callback, mockResponse]() {
        callback(true, mockResponse);
    });
}

String Base44Client::buildUrl(const String& endpoint) {
    return baseUrl + endpoint;
}

StringPairArray Base44Client::getHeaders() {
    StringPairArray headers;
    headers.set("Content-Type", "application/json");
    if (authToken.isNotEmpty()) {
        headers.set("Authorization", "Bearer " + authToken);
    }
    return headers;
}
