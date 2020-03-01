package com.asoft.ytdl.model.request;

import com.asoft.ytdl.model.Mp3Metadata;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TagRequest {
    String id;
    String name;
    Mp3Metadata metadata;
}
