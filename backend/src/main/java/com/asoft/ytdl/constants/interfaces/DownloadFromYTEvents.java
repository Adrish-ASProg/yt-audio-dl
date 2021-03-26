package com.asoft.ytdl.constants.interfaces;

import com.asoft.ytdl.constants.enums.ProgressStatus;

public interface DownloadFromYTEvents {
    void onDownloadCompleted(String id, String fileName);

    void onError(String id, Exception exception);

    void onTitleRetrieved(String id, String title);

    void onProgress(String id, ProgressStatus progressStatus);
}
