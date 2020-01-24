package com.asoft.ytdl.interfaces;

public interface DownloadCompletedEvent {
    void onDownloadCompleted(String uuid, String fileName);
}
