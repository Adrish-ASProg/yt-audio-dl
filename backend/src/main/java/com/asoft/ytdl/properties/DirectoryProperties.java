package com.asoft.ytdl.properties;

import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Setter
@Configuration
@ConfigurationProperties(prefix = "directory")
public class DirectoryProperties {
    private String audio;
    private String playlist;

    public String getAudioDirectory() {
        return audio;
    }

    public String getPlaylistDirectory() {
        return playlist;
    }
}
