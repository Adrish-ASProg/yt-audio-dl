package com.asoft.ytdl.utils;

import com.asoft.ytdl.enums.ProgressStatus;
import com.asoft.ytdl.exception.YTDLException;
import com.asoft.ytdl.interfaces.DownloadCompletedEvent;
import com.asoft.ytdl.interfaces.ErrorEvent;
import com.asoft.ytdl.interfaces.ProgressEvent;
import com.asoft.ytdl.interfaces.TitleRetrievedEvent;
import com.asoft.ytdl.service.ApplicationService;
import lombok.Setter;

import java.io.File;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.UUID;


@Setter
public class YTDownloadManager {

    private DownloadCompletedEvent downloadCompletedEvent = (uuid, fileName) -> {};
    private TitleRetrievedEvent titleRetrievedEvent = (uuid, title) -> {};
    private ProgressEvent progressEvent = (uuid, progressStatus) -> {};
    private ErrorEvent errorEvent = (uuid, exception) -> {};

    public YTDownloadManager() {}

    /**
     * Téléchargement d'une vidéo YouTube
     */
    public void download(String url, boolean audioOnly) {
        String destination = ApplicationService.DOWNLOAD_FOLDER + File.separator + "%(title)s.%(ext)s";
        String format = audioOnly ? "mp3" : "best";

        // Retrieve file(s) name(s)
        final LinkedHashMap<String, String> fileNames = getVideoTitles(url);


        if (fileNames.size() == 0) {
            errorEvent.onError(null, new YTDLException("[download] Unable to download file: No file found"));
        }

        for (int i = 0; i < fileNames.keySet().size(); i++) {
            String uuid = (new ArrayList<>(fileNames.keySet())).get(i);

            // Prepare download
            String dlCommand = audioOnly
                    ? String.format("youtube-dl -o \"%s\" --no-playlist --extract-audio --audio-format %s --playlist-items %d %s", destination, format, i + 1, url)
                    : String.format("youtube-dl -o \"%s\" --no-playlist -f %s %s", destination, format, url);

            System.out.println(dlCommand);
            progressEvent.onProgress(uuid, ProgressStatus.STARTING_DOWNLOAD);

            // Handle progress
            final String downloadPagePrefix = "[youtube]";
            final String downloadPrefix = "[download]";
            final String convertPrefix = "[ffmpeg]";

            CmdManager cmdManager = new CmdManager();
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
            cmdManager.setErrorEvent((text) -> errorEvent.onError(uuid, new YTDLException(text)));
            cmdManager.executeCommand(dlCommand);

            String fileName = fileNames.get(uuid);
            System.out.println("Completed, file name: " + fileName);
            downloadCompletedEvent.onDownloadCompleted(uuid, fileName);
        }
    }

    /**
     * Retrieve videos title
     **/
    private LinkedHashMap<String, String> getVideoTitles(String url) {
        String getNameCommand = "youtube-dl -e --no-playlist --flat-playlist " + url;
        System.out.println(getNameCommand);

        final LinkedHashMap<String, String> fileNames = new LinkedHashMap<>();
        CmdManager cmdManager = new CmdManager();
        cmdManager.setErrorEvent((text) ->
                errorEvent.onError(null, new YTDLException("Unable to retrieve video title\n" + text))
        );
        cmdManager.setOutputEvent((text) -> {
            if (!text.startsWith("Process terminated")) {
                String uuid = UUID.randomUUID().toString();
                String fileName = this.sanitizeFileName(text);
                fileNames.put(uuid, fileName);
                titleRetrievedEvent.onTitleRetrievedEvent(uuid, fileName);
                System.out.println("File name: " + fileName);
            }
        });
        cmdManager.executeCommand(getNameCommand);

        return fileNames;
    }

    private String sanitizeFileName(String filename) {
        return filename.replace("\"", "'");
    }
}
