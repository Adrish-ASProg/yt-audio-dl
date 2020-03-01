package com.asoft.ytdl.model.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class DLFileAsZipRequest {
    private List<String> ids;
    private Boolean createPlaylist;
    private String filePath;
}