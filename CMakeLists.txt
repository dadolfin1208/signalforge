cmake_minimum_required(VERSION 3.22)
project(SignalForge VERSION 0.1.0 LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# JUCE
add_subdirectory(ThirdParty/JUCE)

juce_add_gui_app(SignalForge
    PRODUCT_NAME "SignalForge"
    COMPANY_NAME "SignalForge"
)

# Source files
target_sources(SignalForge PRIVATE
    Source/Main.cpp
    Source/MainComponent.cpp
)

# Recommended JUCE flags
target_compile_definitions(SignalForge PRIVATE
    JUCE_WEB_BROWSER=0
    JUCE_USE_CURL=1
    JUCE_APPLICATION_NAME_STRING="$<TARGET_PROPERTY:SignalForge,JUCE_PRODUCT_NAME>"
    JUCE_APPLICATION_VERSION_STRING="$<TARGET_PROPERTY:SignalForge,JUCE_VERSION>"
)

target_link_libraries(SignalForge PRIVATE
    juce::juce_core
    juce::juce_events
    juce::juce_graphics
    juce::juce_gui_basics
    juce::juce_audio_basics
    juce::juce_audio_devices
)

# Linux system libs JUCE expects
find_package(PkgConfig REQUIRED)
pkg_check_modules(ALSA REQUIRED alsa)

target_link_libraries(SignalForge PRIVATE
    ${ALSA_LIBRARIES}
    curl
    pthread
    dl
)

target_include_directories(SignalForge PRIVATE
    ${ALSA_INCLUDE_DIRS}
)
