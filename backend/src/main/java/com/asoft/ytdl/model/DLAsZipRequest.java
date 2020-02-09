package com.asoft.ytdl.model;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class DLAsZipRequest {
    private List<String> uuids;
    private Boolean createPlaylist;
    private String filePath;
}