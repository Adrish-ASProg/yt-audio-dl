package com.asoft.ytdl.enums;

public enum ProgressStatus {
    INITIALIZING("Initializing"),
    STARTING_DOWNLOAD("Starting download"),
    DOWNLOADING_WEBPAGE("Downloading webpage"),
    DOWNLOADING_VIDEO("Downloading"),
    CONVERTING_TO_AUDIO("Converting"),
    COMPLETED("Completed"),
    ERROR("Error");

    final String value;

    ProgressStatus(String val) {
        this.value = val;
    }

    @Override
    public String toString() {
        return value;
    }
}
