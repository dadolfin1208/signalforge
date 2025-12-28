# SignalForge

## Building on Linux

### Dependencies

To build SignalForge on Linux, you need the following dependencies:

-   A C++ compiler (e.g., GCC or Clang)
-   CMake (version 3.22 or higher)
-   ALSA development files (`libasound2-dev` on Debian/Ubuntu)
-   GTK3 development files (`libgtk-3-dev` on Debian/Ubuntu)
-   WebKitGTK development files (`libsoup2.4-dev` `libwebkit2gtk-4.0-dev` on Debian/Ubuntu)
-   FreeType development files (`libfreetype6-dev` on Debian/Ubuntu)
-   Fontconfig development files (`libfontconfig1-dev` on Debian/Ubuntu)
-   CURL development files (`libcurl4-openssl-dev` on Debian/Ubuntu)

You can install them on a Debian-based system with:
```bash
sudo apt-get update && sudo apt-get install build-essential cmake libasound2-dev libgtk-3-dev libsoup2.4-dev libwebkit2gtk-4.0-dev libfreetype6-dev libfontconfig1-dev libcurl4-openssl-dev
```

### Building

To build the project, use the provided scripts:

```bash
# Configure the project
./scripts/configure.sh

# Build the project
./scripts/build.sh
```

### Running

To run the application:

```bash
./scripts/run.sh
```

### Cleaning

To clean the build artifacts:

```bash
./scripts/clean.sh
<<<<<<< Updated upstream
```

## How to record a test file

To record a test file:

1.  Launch the application using `./scripts/run.sh`.
2.  In the application window, ensure an audio input device is selected via the audio settings component.
3.  Click the "Record" button. The status label will change to "Recording...".
4.  Speak into your microphone or play audio through your selected input device.
5.  Click the "Stop" button. The status label will change back to "Idle".
6.  Your recorded `.wav` file will be saved in the `~/SignalForgeRecordings/` directory, named with a timestamp.
