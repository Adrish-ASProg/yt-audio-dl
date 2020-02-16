package com.asoft.ytdl.utils;

import com.asoft.ytdl.enums.ProgressStatus;
import com.asoft.ytdl.exception.YTDLException;
import com.asoft.ytdl.interfaces.DownloadCompletedEvent;
import com.asoft.ytdl.interfaces.ErrorEvent;
import com.asoft.ytdl.interfaces.ProgressEvent;
import com.asoft.ytdl.interfaces.TitleRetrievedEvent;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.apache.commons.collections.CollectionUtils;

import java.io.File;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static com.asoft.ytdl.utils.SettingsManager.DOWNLOAD_FOLDER;


@Setter
@NoArgsConstructor
public class YTDownloadManager {

    private DownloadCompletedEvent downloadCompletedEvent = (id, fileName) -> {};
    private TitleRetrievedEvent titleRetrievedEvent = (id, title) -> {};
    private ProgressEvent progressEvent = (id, progressStatus) -> {};
    private ErrorEvent errorEvent = (id, exception) -> {};
    private List<String> skippedId = new ArrayList<>();

    /**
     * Téléchargement de vidéo / playlist YouTube au format mp3
     */
    public void download(String url) {
        // Retrieve file(s) name(s)
        final LinkedHashMap<String, String> fileNames = getVideoTitles(url);

        if (fileNames.size() == 0) {
            errorEvent.onError(null, new YTDLException("[download] Unable to download file: No file found"));
        }

        if (!CollectionUtils.isEmpty(skippedId)) {
            skippedId.forEach(id -> {
                if (fileNames.containsKey(id)) {
                    System.out.printf("Skipping already existing file %s (%s)\n", fileNames.get(id), id);
                    fileNames.remove(id);
                }
            });
        }

        if (fileNames.size() < 1) {
            System.out.println("No files to download");
            return;
        }

        System.out.println(String.format("Starting download of %d files..\n", fileNames.size()));

        final ExecutorService executor = Executors.newFixedThreadPool(12);
        for (int i = 0; i < fileNames.keySet().size(); i++) {
            // Prepare download
            String id = (new ArrayList<>(fileNames.keySet())).get(i);
            String fileName = fileNames.get(id);
            String destination = DOWNLOAD_FOLDER + File.separator + fileName + ".%(ext)s";

            String dlCommand = String.format("youtube-dl -o \"%s\" --no-playlist --extract-audio --audio-format mp3 --playlist-items %d %s", destination, i + 1, url);
            executor.execute(() -> downloadFile(dlCommand, id, fileName, executor));
        }

        try {
            executor.awaitTermination(300, TimeUnit.SECONDS);
            System.out.println("########## All files downloaded successfully ##########");
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    private void downloadFile(String dlCommand, String id, String fileName, ExecutorService executor) {
        System.out.println(String.format("########## Downloading « %s » ##########", fileName));

        progressEvent.onProgress(id, ProgressStatus.STARTING_DOWNLOAD);

        // Handle progress
        final String downloadPagePrefix = "[youtube]";
        final String downloadPrefix = "[download]";
        final String convertPrefix = "[ffmpeg]";

        CmdManager cmdManager = new CmdManager(false);
        cmdManager.setOutputEvent(text -> {
            if (text.startsWith(downloadPagePrefix)) {
                progressEvent.onProgress(id, ProgressStatus.DOWNLOADING_WEBPAGE);
            } else if (text.startsWith(downloadPrefix)) {
                progressEvent.onProgress(id, ProgressStatus.DOWNLOADING_VIDEO);
            } else if (text.startsWith(convertPrefix)) {
                progressEvent.onProgress(id, ProgressStatus.CONVERTING_TO_AUDIO);
            }
        });
        cmdManager.setErrorEvent(text -> errorEvent.onError(id, new YTDLException(text)));
        cmdManager.executeCommand(dlCommand);

        System.out.println("_________ File downloaded: " + fileName + " _________");
        downloadCompletedEvent.onDownloadCompleted(id, fileName);
        executor.shutdown();
    }

    /**
     * Retrieve videos title
     **/
    private LinkedHashMap<String, String> getVideoTitles(String url) {
        String getNameCommand = "youtube-dl --get-filename --no-playlist --flat-playlist --restrict-filenames -o %(id)s__--__%(title)s " + url;

        final LinkedHashMap<String, String> fileNames = new LinkedHashMap<>();
        CmdManager cmdManager = new CmdManager(true);
        cmdManager.setErrorEvent((text) ->
                errorEvent.onError(null, new YTDLException("Unable to retrieve video title\n" + text))
        );
        cmdManager.setOutputEvent(output -> {
            if (!output.startsWith("Process terminated")) {
                String[] splittedOutput = output.split("__--__");
                String id = splittedOutput[0];
                String title = splittedOutput[1].replace("_", " ");
                fileNames.put(id, title);
                titleRetrievedEvent.onTitleRetrievedEvent(id, title);
                System.out.println(String.format("File name: « %s »", title));
            }
        });
        cmdManager.executeCommand(getNameCommand);

        return fileNames;
    }
}
