package com.asoft.ytdl.interfaces;

@FunctionalInterface
public interface DownloadCompletedEvent {
    void onDownloadCompleted(String uuid, String fileName);
}
