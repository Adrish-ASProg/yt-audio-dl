package com.asoft.ytdl.properties;

import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Setter
@Configuration
@ConfigurationProperties(prefix = "directory")
public class DirectoryProperties {
    private String audio;

    public String getAudioDirectory() {
        return audio;
    }
}
