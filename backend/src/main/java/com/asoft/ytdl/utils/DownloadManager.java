package com.asoft.ytdl.utils;

import org.springframework.util.StringUtils;

public abstract class DownloadManager {

    public enum ProgressStatus {
        DOWNLOADING_VIDEO("Downloading"),
        CONVERTING_TO_AUDIO("Converting"),
        COMPLETED("Completed");

        String value;

        ProgressStatus(String val) {
            this.value = val;
        }

        @Override
        public String toString() {
            return value;
        }
    }

    public abstract void log(String output, boolean isError);

    public abstract void onDownloadCompleted(String fileName);

    public abstract void onProgress(ProgressStatus progressStatus);

    public DownloadManager() {
    }

    /** Téléchargement d'une vidéo YouTube */
    public void download(String url, boolean audioOnly, String format) {
        Thread t = new Thread(() -> downloadInNewThread(url, audioOnly, format));
        t.start();
    }

    public void downloadInNewThread(String url, boolean audioOnly, String format) {
        if (format.equals("auto") && audioOnly) format = "mp3";
        if (format.equals("auto") && !audioOnly) format = "best";
        // String destinationFolder = audioOnly ? Config.getAudioFolder() : Config.getVideoFolder();
        // if (destinationFolder != null) destinationFolder = destinationFolder.replace("\\", "/") + "/";
        // String destination = destinationFolder + "%(title)s.%(ext)s";
        String destination = "C:\\Users\\10130383\\" + "%(title)s.%(ext)s";

        String command;
        if (audioOnly) command = String.format("youtube-dl -o \"%s\" --extract-audio --audio-format %s %s", destination, format, url);
        else command = String.format("youtube-dl -o \"%s\" -f %s %s", destination, format, url);

        log(command, false);

        final StringBuilder fileName = new StringBuilder();
        final String fileNamePrefix = "[ffmpeg] Destination: ";
        final String downloadPrefix = "[download]";
        final String convertPrefix = "[ffmpeg]";

        CmdManager cmdManager = new CmdManager() {
            @Override
            void handleOutput(String text) {
                if (text.startsWith(fileNamePrefix)) {
                    fileName.append(text.substring(fileNamePrefix.length()));
                }
                else if (text.startsWith(downloadPrefix)) {
                    onProgress(ProgressStatus.DOWNLOADING_VIDEO);
                }
                else if (text.startsWith(convertPrefix)) {
                    onProgress(ProgressStatus.CONVERTING_TO_AUDIO);
                }

                log(text, false);
            }

            @Override
            void handleError(String text) {
                log(text, true);
            }
        };
        cmdManager.ExecuteCommand(command);
        log("Finish, file name: " + fileName, false);
        onDownloadCompleted(fileName.toString());
    }

    public static String Download(String url, boolean audioOnly, String format) {
        if (format.equals("auto") && audioOnly) format = "mp3";
        if (format.equals("auto") && !audioOnly) format = "best";
        // String destinationFolder = audioOnly ? Config.getAudioFolder() : Config.getVideoFolder();
        // if (destinationFolder != null) destinationFolder = destinationFolder.replace("\\", "/") + "/";
        // String destination = destinationFolder + "%(title)s.%(ext)s";
        String destination = "C:\\Users\\10130383\\" + "%(title)s.%(ext)s";

        String command;
        if (audioOnly) command = String.format("youtube-dl -o \"%s\" --extract-audio --audio-format %s %s", destination, format, url);
        else command = String.format("youtube-dl -o \"%s\" -f %s %s", destination, format, url);

        System.out.println(command);

        final StringBuilder fileName = new StringBuilder();
        final String convertPrefix = "[ffmpeg]";
        final String fileNamePrefix = "[ffmpeg] Destination: ";

        CmdManager cmdManager = new CmdManager() {
            @Override
            void handleOutput(String text) {
                if (text.startsWith(convertPrefix)) {

                    fileName.append(text.substring(fileNamePrefix.length()));
                }
                if (text.startsWith(fileNamePrefix)) {
                    fileName.append(text.substring(fileNamePrefix.length()));
                }
                System.out.println(text);
            }

            @Override
            void handleError(String text) {
                System.err.println(text);
            }
        };
        cmdManager.ExecuteCommand(command);

        if (!StringUtils.isEmpty(fileName.toString()))
            System.out.println("Finish, file name: " + fileName);

        return fileName.toString();
    }
}
