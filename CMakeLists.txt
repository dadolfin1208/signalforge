cmake_minimum_required(VERSION 3.22)
project(SignalForge VERSION 0.1.0 LANGUAGES C CXX)

# Set C++ standard
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Build configuration options
option(SIGNALFORGE_BUILD_AI_MODULES "Build AI processing modules" OFF)
option(SIGNALFORGE_BUILD_PLUGINS "Build plugin support (VST3/AU/LV2)" ON)
option(SIGNALFORGE_USE_JACK "Enable JACK audio driver support" ON)
option(SIGNALFORGE_USE_OPENGL "Enable OpenGL acceleration" ON)

# Set build type if not specified
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE "Debug" CACHE STRING "Build type" FORCE)
endif()

# JUCE as a submodule
add_subdirectory(ThirdParty/JUCE)

# Create the main application
juce_add_gui_app(SignalForge
    PRODUCT_NAME "SignalForge"
    COMPANY_NAME "SignalForge Audio"
    VERSION ${PROJECT_VERSION}
    BUNDLE_ID "com.signalforge.signalforge"
    MICROPHONE_PERMISSION_ENABLED TRUE
    MICROPHONE_PERMISSION_TEXT "SignalForge needs microphone access for audio recording"
)

# Generate JUCE header
juce_generate_juce_header(SignalForge)

# Core application sources
target_sources(SignalForge PRIVATE
    # Main application
    Source/Main.cpp
    Source/MainComponent.cpp
    Source/Utils/Logger.cpp
    
    # GUI Components
    Source/GUI/TrackView.cpp
    Source/GUI/MixerPanel.cpp
    Source/GUI/TransportControls.cpp
    Source/GUI/MidiSettingsPanel.cpp
    Source/GUI/EffectsPanel.cpp
    Source/GUI/PluginBrowser.cpp
    Source/GUI/WaveformDisplay.cpp
    
    # Audio Engine
    Core/AudioEngine/AudioEngine.cpp
    Core/AudioEngine/Meter.cpp
    Core/AudioEngine/Track.cpp
    Core/AudioEngine/MultiTrackMixer.cpp
    Core/AudioEngine/MidiManager.cpp
    Core/AudioEngine/EffectsProcessor.cpp
    Core/AudioEngine/PluginHost.cpp
    Core/AudioEngine/AudioRecorder.cpp
    Core/AudioEngine/ProjectManager.cpp
)

# Include directories
target_include_directories(SignalForge PRIVATE
    Source
    Core
    ${CMAKE_CURRENT_SOURCE_DIR}
)

# JUCE compile definitions
target_compile_definitions(SignalForge PRIVATE
    JUCE_WEB_BROWSER=0
    JUCE_USE_CURL=1
    JUCE_APPLICATION_NAME_STRING="$<TARGET_PROPERTY:SignalForge,JUCE_PRODUCT_NAME>"
    JUCE_APPLICATION_VERSION_STRING="$<TARGET_PROPERTY:SignalForge,JUCE_VERSION>"
    JUCE_DISPLAY_SPLASH_SCREEN=0
    JUCE_REPORT_APP_USAGE=0
    JUCE_ALIVECHECK_DISABLE_WARNINGS=1
)

# Core JUCE modules
target_link_libraries(SignalForge PRIVATE
    juce::juce_core
    juce::juce_events
    juce::juce_graphics
    juce::juce_gui_basics
    juce::juce_gui_extra
    juce::juce_audio_basics
    juce::juce_audio_devices
    juce::juce_audio_formats
    juce::juce_audio_processors
    juce::juce_audio_utils
    juce::juce_dsp
)

# Optional OpenGL support
if(SIGNALFORGE_USE_OPENGL)
    target_link_libraries(SignalForge PRIVATE juce::juce_opengl)
    target_compile_definitions(SignalForge PRIVATE SIGNALFORGE_OPENGL=1)
endif()

# Optional plugin support
if(SIGNALFORGE_BUILD_PLUGINS)
    target_compile_definitions(SignalForge PRIVATE 
        SIGNALFORGE_PLUGINS=1
        JUCE_PLUGINHOST_VST3=1
        JUCE_PLUGINHOST_AU=1
        JUCE_PLUGINHOST_LV2=1
        JUCE_PLUGINHOST_VST=0
    )
    message(STATUS "Plugin hosting enabled - VST3/AU support")
endif()

# Platform-specific configurations
if(UNIX AND NOT APPLE)
    # Linux-specific setup
    find_package(PkgConfig REQUIRED)
    
    # ALSA (required)
    pkg_check_modules(ALSA REQUIRED alsa)
    target_include_directories(SignalForge PRIVATE ${ALSA_INCLUDE_DIRS})
    target_link_libraries(SignalForge PRIVATE ${ALSA_LIBRARIES})
    
    # JACK (optional)
    if(SIGNALFORGE_USE_JACK)
        pkg_check_modules(JACK jack)
        if(JACK_FOUND)
            target_include_directories(SignalForge PRIVATE ${JACK_INCLUDE_DIRS})
            target_link_libraries(SignalForge PRIVATE ${JACK_LIBRARIES})
            target_compile_definitions(SignalForge PRIVATE SIGNALFORGE_JACK=1)
            message(STATUS "JACK support enabled")
        else()
            message(WARNING "JACK requested but not found - disabling JACK support")
        endif()
    endif()
    
    # CURL for networking
    find_package(CURL REQUIRED)
    target_link_libraries(SignalForge PRIVATE CURL::libcurl)
    
    # GTK3 for native Linux GUI
    pkg_check_modules(GTK3 REQUIRED gtk+-3.0)
    target_include_directories(SignalForge PRIVATE ${GTK3_INCLUDE_DIRS})
    target_link_libraries(SignalForge PRIVATE ${GTK3_LIBRARIES})
    
    # X11 for window management
    find_package(X11 REQUIRED)
    target_link_libraries(SignalForge PRIVATE ${X11_LIBRARIES})
    
    # Freetype for font rendering
    find_package(Freetype REQUIRED)
    target_link_libraries(SignalForge PRIVATE Freetype::Freetype)
    
    # Threading
    find_package(Threads REQUIRED)
    target_link_libraries(SignalForge PRIVATE Threads::Threads)

elseif(APPLE)
    # macOS-specific setup
    target_link_libraries(SignalForge PRIVATE
        "-framework Cocoa"
        "-framework CoreAudio"
        "-framework CoreMIDI"
        "-framework AudioUnit"
        "-framework AudioToolbox"
        "-framework Accelerate"
        "-framework CoreFoundation"
        "-framework IOKit"
    )
    
    # macOS audio driver detection
    find_library(COREAUDIO_FRAMEWORK CoreAudio)
    find_library(COREMIDI_FRAMEWORK CoreMIDI)
    find_library(AUDIOUNIT_FRAMEWORK AudioUnit)
    find_library(AUDIOTOOLBOX_FRAMEWORK AudioToolbox)
    
    if(COREAUDIO_FRAMEWORK AND COREMIDI_FRAMEWORK)
        message(STATUS "CoreAudio and CoreMIDI found - macOS audio support enabled")
        target_compile_definitions(SignalForge PRIVATE SIGNALFORGE_COREAUDIO=1)
    endif()
    
    if(SIGNALFORGE_USE_OPENGL)
        target_link_libraries(SignalForge PRIVATE "-framework OpenGL")
    endif()
    
    # macOS app bundle configuration
    set_target_properties(SignalForge PROPERTIES
        MACOSX_BUNDLE TRUE
        MACOSX_BUNDLE_INFO_PLIST "${CMAKE_CURRENT_SOURCE_DIR}/Resources/Info.plist.in"
        MACOSX_BUNDLE_BUNDLE_NAME "SignalForge"
        MACOSX_BUNDLE_BUNDLE_VERSION ${PROJECT_VERSION}
        MACOSX_BUNDLE_SHORT_VERSION_STRING ${PROJECT_VERSION}
        MACOSX_BUNDLE_IDENTIFIER "com.signalforge.signalforge"
    )

elseif(WIN32)
    # Windows-specific setup
    target_link_libraries(SignalForge PRIVATE
        winmm
        ole32
        ws2_32
        wininet
        version
        shlwapi
        oleaut32
    )
    
    if(SIGNALFORGE_USE_OPENGL)
        target_link_libraries(SignalForge PRIVATE opengl32)
    endif()
endif()

# AI Modules (optional)
if(SIGNALFORGE_BUILD_AI_MODULES)
    # Create AI Engine placeholder
    add_subdirectory(Core/AIEngine)
    target_link_libraries(SignalForge PRIVATE SignalForgeAI)
    target_compile_definitions(SignalForge PRIVATE SIGNALFORGE_AI=1)
    message(STATUS "AI modules enabled")
endif()

# Compiler-specific optimizations
if(CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
    target_compile_options(SignalForge PRIVATE
        -Wall -Wextra -Wpedantic
        $<$<CONFIG:Release>:-O3 -DNDEBUG>
        $<$<CONFIG:Debug>:-g -O0>
    )
elseif(MSVC)
    target_compile_options(SignalForge PRIVATE
        /W4
        $<$<CONFIG:Release>:/O2 /DNDEBUG>
        $<$<CONFIG:Debug>:/Od /Zi>
    )
endif()

# Install configuration
install(TARGETS SignalForge
    BUNDLE DESTINATION .
    RUNTIME DESTINATION bin
)

# CPack configuration for packaging
set(CPACK_PACKAGE_NAME "SignalForge")
set(CPACK_PACKAGE_VERSION ${PROJECT_VERSION})
set(CPACK_PACKAGE_DESCRIPTION_SUMMARY "Professional Digital Audio Workstation")
set(CPACK_PACKAGE_VENDOR "SignalForge Audio")

if(UNIX AND NOT APPLE)
    set(CPACK_GENERATOR "DEB;RPM;TGZ")
    set(CPACK_DEBIAN_PACKAGE_DEPENDS "libasound2, libgtk-3-0, libcurl4")
elseif(APPLE)
    set(CPACK_GENERATOR "DragNDrop")
elseif(WIN32)
    set(CPACK_GENERATOR "NSIS;ZIP")
endif()

include(CPack)

# Print configuration summary
message(STATUS "")
message(STATUS "SignalForge Configuration Summary:")
message(STATUS "  Version: ${PROJECT_VERSION}")
message(STATUS "  Build Type: ${CMAKE_BUILD_TYPE}")
message(STATUS "  C++ Standard: ${CMAKE_CXX_STANDARD}")
message(STATUS "  AI Modules: ${SIGNALFORGE_BUILD_AI_MODULES}")
message(STATUS "  Plugin Support: ${SIGNALFORGE_BUILD_PLUGINS}")
message(STATUS "  JACK Support: ${SIGNALFORGE_USE_JACK}")
message(STATUS "  OpenGL Support: ${SIGNALFORGE_USE_OPENGL}")
message(STATUS "")
