package com.asoft.ytdl.interfaces;

import com.asoft.ytdl.enums.ProgressStatus;

public interface ProgressEvent {
    void onProgress(String uuid, ProgressStatus progressStatus);
}
