package com.asoft.ytdl.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TagRequest {
    String id;
    String name;
    Mp3Metadata metadata;
}
