package com.asoft.ytdl.utils;

import com.asoft.ytdl.enums.ProgressStatus;
import com.asoft.ytdl.service.ApplicationService;
import org.apache.commons.lang3.StringUtils;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public abstract class DownloadManager {

    protected DownloadManager() {}

    public abstract void onDownloadCompleted(String uuid, String fileName);

    public abstract void onProgress(String uuid, ProgressStatus progressStatus);

    /**
     * Téléchargement d'une vidéo YouTube
     */
    public void download(String url, boolean audioOnly) throws RuntimeException {
        String destination = ApplicationService.DOWNLOAD_FOLDER + File.separator + "%(title)s.%(ext)s";
        String format = audioOnly ? "mp3" : "best";

        StringBuilder error = new StringBuilder();

        //Retrieve file(s) name(s)
        final List<String> fileNames = new ArrayList<>();
        String getNameCommand = "youtube-dl -e --no-playlist --flat-playlist " + url;
        System.out.println(getNameCommand);
        new CmdManager() {
            @Override
            void handleOutput(String text) {
                if (!text.startsWith("Process terminated")) {
                    fileNames.add(text);
                    System.out.println("File name: " + text);
                }
            }

            @Override
            void handleError(String text) {
                System.err.println(text);
                error.append(text);
            }
        }.executeCommand(getNameCommand);

        if (!StringUtils.isEmpty(error.toString())) {
            throw new RuntimeException(error.toString());
        }


        for (int i = 0; i < fileNames.size(); i++) {
            String uuid = UUID.randomUUID().toString();
            String fileName = fileNames.get(i);

            // Prepare download
            String dlCommand = audioOnly
                    ? String.format("youtube-dl -o \"%s\" --no-playlist --extract-audio --audio-format %s --playlist-items %d %s", destination, format, i + 1, url)
                    : String.format("youtube-dl -o \"%s\" --no-playlist -f %s %s", destination, format, url);

            System.out.println(dlCommand);
            onProgress(uuid, ProgressStatus.INITIALIZING);

            // Handle progress
            final String downloadPagePrefix = "[youtube]";
            final String downloadPrefix = "[download]";
            final String convertPrefix = "[ffmpeg]";

            new CmdManager() {
                @Override
                void handleOutput(String text) {
                    if (text.startsWith(downloadPagePrefix)) {
                        onProgress(uuid, ProgressStatus.DOWNLOADING_WEBPAGE);
                    } else if (text.startsWith(downloadPrefix)) {
                        onProgress(uuid, ProgressStatus.DOWNLOADING_VIDEO);
                    } else if (text.startsWith(convertPrefix)) {
                        onProgress(uuid, ProgressStatus.CONVERTING_TO_AUDIO);
                    }

                    System.out.println(text);
                }

                @Override
                void handleError(String text) {
                    System.err.println(text);
                    error.append(text);
                }
            }.executeCommand(dlCommand);

            if (!StringUtils.isEmpty(error.toString())) {
                throw new RuntimeException(uuid + "|" + error.toString());
            }

            System.out.println("Completed, file name: " + fileName);
            onDownloadCompleted(uuid, fileName);
        }
    }
}
