package com.asoft.ytdl.utils;

import com.asoft.ytdl.enums.ProgressStatus;
import com.asoft.ytdl.service.ApplicationService;
import org.apache.commons.lang3.StringUtils;

import java.io.File;

public abstract class DownloadManager {

    public abstract void onDownloadCompleted(String fileName);

    public abstract void onProgress(ProgressStatus progressStatus);


    public DownloadManager() {
    }

    /**
     * Téléchargement d'une vidéo YouTube
     */
    public void download(String url, boolean audioOnly) throws RuntimeException {
        String destination = ApplicationService.DOWNLOAD_FOLDER + File.separator + "%(title)s.%(ext)s";
        String format = audioOnly ? "mp3" : "best";

        StringBuilder error = new StringBuilder();
        // Retrieve filename
        final StringBuilder fileName = new StringBuilder();

        System.out.println("youtube-dl -e " + url);
        new CmdManager() {
            @Override
            void handleOutput(String text) {
                if (!text.startsWith("Process terminated")) {
                    fileName.append(text);
                    System.out.println("File name: " + fileName);
                }
            }

            @Override
            void handleError(String text) {
                System.err.println(text);
                error.append(text);
            }
        }.ExecuteCommand("youtube-dl -e --no-playlist " + url);

        if (!StringUtils.isEmpty(error.toString())) {
            throw new RuntimeException(error.toString());
        }

        // Prepare download
        String command = audioOnly
                ? String.format("youtube-dl -o \"%s\" --no-playlist --extract-audio --audio-format %s %s", destination, format, url)
                : String.format("youtube-dl -o \"%s\" --no-playlist -f %s %s", destination, format, url);

        System.out.println(command);

        // Handle progress
        final String downloadPagePrefix = "[youtube]";
        final String downloadPrefix = "[download]";
        final String convertPrefix = "[ffmpeg]";
        new CmdManager() {
            @Override
            void handleOutput(String text) {
                if (text.startsWith(downloadPagePrefix)) {
                    onProgress(ProgressStatus.DOWNLOADING_WEBPAGE);
                } else if (text.startsWith(downloadPrefix)) {
                    onProgress(ProgressStatus.DOWNLOADING_VIDEO);
                } else if (text.startsWith(convertPrefix)) {
                    onProgress(ProgressStatus.CONVERTING_TO_AUDIO);
                }

                System.out.println(text);
            }

            @Override
            void handleError(String text) {
                System.err.println(text);
                error.append(text);
            }
        }.ExecuteCommand(command);

        if (!StringUtils.isEmpty(error.toString())) {
            throw new RuntimeException(error.toString());
        }

        System.out.println("Completed, file name: " + fileName);
        onDownloadCompleted(fileName.toString());
    }
}
