package com.asoft.ytdl.model.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class VideoInfo {
    private final String id;
    private final String title;
    private final String thumbnailUrl;
}
