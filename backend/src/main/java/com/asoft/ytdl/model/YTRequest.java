package com.asoft.ytdl.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class YTRequest {
    private String url;
    private Boolean audioOnly;
}