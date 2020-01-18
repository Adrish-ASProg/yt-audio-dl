package com.asoft.ytdl.utils;

import com.asoft.ytdl.enums.ProgressStatus;

public abstract class DownloadManager {

    public abstract void onDownloadCompleted(String fileName);

    public abstract void onProgress(ProgressStatus progressStatus);


    public DownloadManager() {}

    /**
     * Téléchargement d'une vidéo YouTube
     */
    public void download(String url, boolean audioOnly) {
        Thread t = new Thread(() -> downloadInNewThread(url, audioOnly));
        t.start();
    }

    public void downloadInNewThread(String url, boolean audioOnly) {
        // String destination = destinationFolder + "%(title)s.%(ext)s";
        // String destination = "C:\\Users\\10130383\\" + "%(title)s.%(ext)s";
        String destination = "E:\\Adri\\" + "%(title)s.%(ext)s";
        String format = audioOnly ? "mp3" : "best";

        String command = audioOnly
                ? String.format("youtube-dl -o \"%s\" --extract-audio --audio-format %s %s", destination, format, url)
                : String.format("youtube-dl -o \"%s\" -f %s %s", destination, format, url);

        System.out.println(command);

        final StringBuilder fileName = new StringBuilder();
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
            }
        }.ExecuteCommand("youtube-dl -e " + url);


        final String downloadPrefix = "[download]";
        final String convertPrefix = "[ffmpeg]";
        new CmdManager() {
            @Override
            void handleOutput(String text) {
                if (text.startsWith(downloadPrefix)) {
                    onProgress(ProgressStatus.DOWNLOADING_VIDEO);
                } else if (text.startsWith(convertPrefix)) {
                    onProgress(ProgressStatus.CONVERTING_TO_AUDIO);
                }

                System.out.println(text);
            }

            @Override
            void handleError(String text) {
                System.err.println(text);
            }
        }.ExecuteCommand(command);

        System.out.println("Completed, file name: " + fileName);
        onDownloadCompleted(fileName.toString());
    }
}
