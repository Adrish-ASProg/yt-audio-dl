package com.asoft.ytdl.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConvertRequest {
    private String url;
    private Boolean audioOnly;
}