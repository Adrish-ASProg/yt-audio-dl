package com.asoft.ytdl.exception;

public class UncompletedDownloadException extends RuntimeException {

    public UncompletedDownloadException(String errorMessage) {
        super(errorMessage);
    }

}
