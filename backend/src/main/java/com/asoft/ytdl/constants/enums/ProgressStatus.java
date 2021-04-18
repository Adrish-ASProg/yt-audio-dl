package com.asoft.ytdl.constants.enums;

public enum ProgressStatus {
    INITIALIZING("Initializing"),
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
