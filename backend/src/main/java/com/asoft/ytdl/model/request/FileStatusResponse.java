package com.asoft.ytdl.model.request;

import com.asoft.ytdl.model.FileStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class FileStatusResponse {
    private Integer totalLength;
    private List<FileStatus> filesStatus;
}