package com.asoft.ytdl.utils;

import com.asoft.ytdl.enums.ProgressStatus;
import com.asoft.ytdl.interfaces.DownloadCompletedEvent;
import com.asoft.ytdl.interfaces.ProgressEvent;
import com.asoft.ytdl.service.ApplicationService;
import lombok.Setter;
import org.apache.commons.lang3.StringUtils;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;



@Setter
public class YTDownloadManager {

    private DownloadCompletedEvent downloadCompletedEvent = (uuid, fileName) -> {};
    private ProgressEvent progressEvent = (uuid, progressStatus) -> {};

    public YTDownloadManager() {}

    /**
     * Téléchargement d'une vidéo YouTube
     */
    public void download(String url, boolean audioOnly) throws RuntimeException {
        String destination = ApplicationService.DOWNLOAD_FOLDER + File.separator + "%(title)s.%(ext)s";
        String format = audioOnly ? "mp3" : "best";

        StringBuilder error = new StringBuilder();

        // Retrieve file(s) name(s)
        final List<String> fileNames = new ArrayList<>();
        String getNameCommand = "youtube-dl -e --no-playlist --flat-playlist " + url;
        System.out.println(getNameCommand);
        CmdManager cmdManager = new CmdManager();
        cmdManager.setErrorEvent((text) -> {
            System.err.println(text);
            error.append(text);
        });
        cmdManager.setOutputEvent((text) -> {
            if (!text.startsWith("Process terminated")) {
                fileNames.add(text);
                System.out.println("File name: " + text);
            }
        });
        cmdManager.executeCommand(getNameCommand);

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
            progressEvent.onProgress(uuid, ProgressStatus.INITIALIZING);

            // Handle progress
            final String downloadPagePrefix = "[youtube]";
            final String downloadPrefix = "[download]";
            final String convertPrefix = "[ffmpeg]";

            cmdManager.setOutputEvent((text) -> {
                if (text.startsWith(downloadPagePrefix)) {
                    progressEvent.onProgress(uuid, ProgressStatus.DOWNLOADING_WEBPAGE);
                } else if (text.startsWith(downloadPrefix)) {
                    progressEvent.onProgress(uuid, ProgressStatus.DOWNLOADING_VIDEO);
                } else if (text.startsWith(convertPrefix)) {
                    progressEvent.onProgress(uuid, ProgressStatus.CONVERTING_TO_AUDIO);
                }

                System.out.println(text);
            });

            cmdManager.executeCommand(dlCommand);

            if (!StringUtils.isEmpty(error.toString())) {
                throw new RuntimeException(uuid + "|" + error.toString());
            }

            System.out.println("Completed, file name: " + fileName);
            downloadCompletedEvent.onDownloadCompleted(uuid, fileName);
        }
    }
}
