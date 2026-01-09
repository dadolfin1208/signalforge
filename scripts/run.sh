#!/bin/bash
set -e

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - run the app bundle
    open ./build/SignalForge_artefacts/Debug/SignalForge.app
else
    # Linux - run the executable directly
    ./build/SignalForge_artefacts/Debug/SignalForge
fi