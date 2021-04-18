package com.asoft.ytdl.constants.interfaces;

public interface DownloadFromYTEvents {
    void onDownloadCompleted(String id, String fileName);

    void onError(String id, Exception exception);
}
