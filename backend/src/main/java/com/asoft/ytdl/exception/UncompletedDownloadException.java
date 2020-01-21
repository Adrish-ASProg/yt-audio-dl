package com.asoft.ytdl.exception;

public class UncompletedDownloadException extends Exception {

    public UncompletedDownloadException(String errorMessage) {
        super(errorMessage);
    }

}
