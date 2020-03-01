package com.asoft.ytdl.model.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class DLPlaylistRequest {
    private List<String> ids;
    private String filePath;
}