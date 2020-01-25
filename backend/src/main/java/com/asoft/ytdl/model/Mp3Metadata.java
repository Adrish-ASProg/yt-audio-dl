package com.asoft.ytdl.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Mp3Metadata {
    private String title;
    private String album;
    private String artist;
    private String genre;

    @Override
    public String toString() {
        return "Mp3Metadata{" +
                "title='" + title + '\'' +
                ", album='" + album + '\'' +
                ", artist='" + artist + '\'' +
                ", genre='" + genre + '\'' +
                '}';
    }
}
