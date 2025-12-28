cmake_minimum_required(VERSION 3.22)
project(SignalForge VERSION 0.1.0)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# JUCE as a submodule at ThirdParty/JUCE
add_subdirectory(ThirdParty/JUCE)

juce_add_gui_app(SignalForge
    PRODUCT_NAME "SignalForge"
    COMPANY_NAME "SignalForge"
)

juce_generate_juce_header(SignalForge)

# Your app sources
target_sources(SignalForge PRIVATE
    Source/Main.cpp
    Source/MainComponent.cpp
    Core/AudioEngine/AudioEngine.cpp
    Core/AudioEngine/Meter.cpp
)

# Add Source directory to includes
target_include_directories(SignalForge PRIVATE
    Source
    Core
)

# JUCE compile definitions
target_compile_definitions(SignalForge PRIVATE
    JUCE_WEB_BROWSER=0
    JUCE_USE_CURL=1
)

# Link JUCE modules
target_link_libraries(SignalForge PRIVATE
    juce::juce_core
    juce::juce_events
    juce::juce_graphics
    juce::juce_gui_basics
    juce::juce_audio_basics
    juce::juce_audio_devices
    juce::juce_audio_formats
    juce::juce_gui_extra
    juce::juce_audio_utils
)

# Linux specific libraries that fix your curl linker errors and GTK deps
if(UNIX AND NOT APPLE)
    find_package(PkgConfig REQUIRED)
    pkg_check_modules(ALSA REQUIRED alsa)

    target_include_directories(SignalForge PRIVATE ${ALSA_INCLUDE_DIRS})
    target_link_libraries(SignalForge PRIVATE ${ALSA_LIBRARIES})

    # curl is needed because JUCE_USE_CURL=1
    find_package(CURL REQUIRED)
    target_link_libraries(SignalForge PRIVATE CURL::libcurl)

    # GTK is used by JUCE on Linux for windowing
    pkg_check_modules(GTK3 REQUIRED gtk+-3.0)
    target_include_directories(SignalForge PRIVATE ${GTK3_INCLUDE_DIRS})
    target_link_libraries(SignalForge PRIVATE ${GTK3_LIBRARIES})
endif()
