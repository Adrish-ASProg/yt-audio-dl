package com.asoft.ytdl.utils;

import org.apache.commons.lang3.tuple.MutablePair;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class PlaylistUtils {

    public static List<String> processPlaylist(final String playlistPathStr, final String newFilepath) throws IOException {
        final var playlistPath = Paths.get(playlistPathStr);
        final Charset charset = StandardCharsets.UTF_8;

        final String newPath = FileUtils.normalizePath(newFilepath, true);
        final var missingFiles = new ArrayList<String>();

        String newContent = Files.readAllLines(playlistPath, charset).stream()
                // Ignore comments
                .filter(line -> !line.startsWith("#"))
                // Keep new filename + old line
                .map(line -> new MutablePair<>(newPath + new File(line).getName(), line))
                // Retrieve missing files
                .peek(pair -> {
                    if (!new File(pair.getLeft()).exists()) missingFiles.add(pair.getRight());
                })
                .map(MutablePair::getLeft)
                .collect(Collectors.joining("\r\n"));

        // Write new content to file
        Files.write(playlistPath, newContent.getBytes(charset));

        return missingFiles;
    }
}
