package com.asoft.ytdl.model.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class DLFromYTRequest {
    private String url;

    private List<String> ids;

    private Boolean selectFiles;
}
