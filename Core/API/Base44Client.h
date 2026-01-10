#pragma once
#include <JuceHeader.h>

class Base44Client {
public:
    Base44Client(const String& baseUrl);
    void setToken(const String& token);
    
    // Auth
    void authenticate(std::function<void(bool, String)> callback);
    bool isAuthenticated();
    
    // Projects
    void createProject(const var& projectData, std::function<void(bool, var)> callback);
    void updateProject(const String& projectId, const var& updateData, std::function<void(bool, var)> callback);
    void listProjects(std::function<void(bool, var)> callback);
    
    // File Management
    void uploadFile(const File& audioFile, std::function<void(bool, String)> callback);
    
    // AI Processing
    void requestMixingAnalysis(const String& projectId, const String& trackName, 
                              const String& fileUrl, std::function<void(bool, var)> callback);
    void getMixingResults(const String& projectId, std::function<void(bool, var)> callback);
    
    void requestMastering(const String& projectId, const String& fileUrl, 
                         int targetLufs, std::function<void(bool, var)> callback);
    void getMasteringResults(const String& projectId, std::function<void(bool, var)> callback);
    
    void requestStemSeparation(const String& projectId, const String& fileUrl, 
                              std::function<void(bool, var)> callback);
    void getStemResults(const String& projectId, std::function<void(bool, var)> callback);

private:
    String baseUrl, authToken;
    
    void makeRequest(const String& endpoint, const String& method, 
                    const var& data, std::function<void(bool, var)> callback);
    String buildUrl(const String& endpoint);
    StringPairArray getHeaders();
};
