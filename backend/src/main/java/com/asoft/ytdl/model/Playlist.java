package com.asoft.ytdl.model;

import com.asoft.ytdl.utils.FileUtils;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Singular;

import java.io.File;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@AllArgsConstructor
public class Playlist {

    public static final String EXTENSION = ".list";

    private String name;

    @Singular
    private List<String> files;

    @JsonIgnore
    public String getFilename() {
        return name + EXTENSION;
    }

    public static Playlist fromFile(final File file) {
        return Playlist.builder()
                .name(file.getName().replace(Playlist.EXTENSION, ""))
                .files(FileUtils.readFileContentAsLines(file))
                .build();
    }

    public void sanitizeFileNames() {
        files = files.stream()
                .filter(fileName -> fileName != null
                        && !fileName.startsWith("#")
                        && fileName.endsWith(".mp3"))
                .collect(Collectors.toList());
    }
}
