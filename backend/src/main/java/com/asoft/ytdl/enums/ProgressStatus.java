package com.asoft.ytdl.enums;

public enum ProgressStatus {
    INITIALIZING("Initializing"),
    DOWNLOADING_VIDEO("Downloading"),
    CONVERTING_TO_AUDIO("Converting"),
    COMPLETED("Completed");

    final String value;

    ProgressStatus(String val) {
        this.value = val;
    }

    @Override
    public String toString() {
        return value;
    }
}
