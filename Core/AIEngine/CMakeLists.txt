cmake_minimum_required(VERSION 3.22)

# AI Engine library
add_library(SignalForgeAI STATIC
    AIEngine.cpp
    AudioAnalyzer.cpp
    SmartMixer.cpp
)

target_include_directories(SignalForgeAI PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/..
)

target_link_libraries(SignalForgeAI PUBLIC
    juce::juce_core
    juce::juce_audio_basics
    juce::juce_dsp
)

# Optional AI framework integration
find_package(PkgConfig QUIET)
if(PkgConfig_FOUND)
    # Check for TensorFlow C++ (if available)
    pkg_check_modules(TENSORFLOW tensorflow)
    if(TENSORFLOW_FOUND)
        target_include_directories(SignalForgeAI PRIVATE ${TENSORFLOW_INCLUDE_DIRS})
        target_link_libraries(SignalForgeAI PRIVATE ${TENSORFLOW_LIBRARIES})
        target_compile_definitions(SignalForgeAI PRIVATE SIGNALFORGE_TENSORFLOW=1)
        message(STATUS "TensorFlow C++ support enabled")
    endif()
endif()

# Python integration (optional)
find_package(Python3 COMPONENTS Interpreter Development QUIET)
if(Python3_FOUND)
    target_include_directories(SignalForgeAI PRIVATE ${Python3_INCLUDE_DIRS})
    target_link_libraries(SignalForgeAI PRIVATE ${Python3_LIBRARIES})
    target_compile_definitions(SignalForgeAI PRIVATE SIGNALFORGE_PYTHON=1)
    message(STATUS "Python integration enabled")
endif()
