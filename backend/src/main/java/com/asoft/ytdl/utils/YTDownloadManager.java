package com.asoft.ytdl.utils;

import com.asoft.ytdl.constants.interfaces.DownloadFromYTEvents;
import com.asoft.ytdl.exception.YTDLException;
import com.asoft.ytdl.model.FileStatus;
import com.asoft.ytdl.model.request.VideoInfo;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.json.JSONObject;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;


@Setter
@RequiredArgsConstructor
public class YTDownloadManager {

    private final DownloadFromYTEvents eventHandler;

    public void updateYtDlVersion() {
        var cmdManager = new CmdManager(false);
        System.out.println("Updating youtube-dl..");
        cmdManager.setOutputEvent(text -> System.out.printf("[youtube-dl update] %s%n", text));
        cmdManager.executeCommand("youtube-dl -U");
    }

    public void printYtDlVersion() {
        var cmdManager = new CmdManager(false);
        cmdManager.setOutputEvent(text -> System.out.printf("Using youtube-dl version %s%n", text));
        cmdManager.executeCommand("youtube-dl --version");
    }

    /**
     * Téléchargement de vidéo / playlist YouTube au format mp3
     */
    public void download(final List<FileStatus> filesStatus,
                         final File destinationFolder) {

        System.out.printf("Starting download of %d files..\n%n", filesStatus.size());

        final var executor = Executors.newFixedThreadPool(5);
        filesStatus.forEach(fileStatus -> {
            // Prepare download
            var fileName = fileStatus.getName();
            var destination = destinationFolder.getAbsolutePath() + File.separator + fileName + ".%(ext)s";

            var dlCommand = String.format("youtube-dl -o \"%s\" --no-playlist --extract-audio --audio-format mp3 %s",
                    destination, fileStatus.getId());
            executor.execute(() -> downloadFile(dlCommand, fileStatus.getId(), fileName, executor));
        });
    }

    private void downloadFile(String dlCommand, String id, String fileName, ExecutorService executor) {
        System.out.printf("########## Downloading « %s » ##########%n", fileName);

        CmdManager cmdManager = new CmdManager(false);
        cmdManager.setOutputEvent(text -> System.out.printf("%s %s%n", id, text));
        cmdManager.setErrorEvent(text -> eventHandler.onError(id, new YTDLException(text)));
        cmdManager.executeCommand(dlCommand);

        System.out.println("_________ File downloaded: " + fileName + " _________");
        eventHandler.onDownloadCompleted(id, fileName);
        executor.shutdown();
    }

    /**
     * Retrieve videos title
     **/
    public List<VideoInfo> getVideoInfos(final String url) {
        final List<VideoInfo> result = new ArrayList<>();

        var cmdManager = new CmdManager(true);
        cmdManager.setErrorEvent(text -> {
            throw new YTDLException("Unable to retrieve video infos\n" + text);
        });

        cmdManager.setOutputEvent(output -> {
            if (!output.startsWith("Process terminated")) {
                var json = new JSONObject(output);
                var videoInfo = VideoInfo.builder()
                        .id(json.getString("id"))
                        .title(sanitizeFilename(json.getString("title")))
                        .thumbnailUrl(json.getString("thumbnail"))
                        .build();
                result.add(videoInfo);

                System.out.printf("File name: « %s »%n", videoInfo.getTitle());
            }
        });
        cmdManager.executeCommand("youtube-dl -j " + url);

        return result;
    }

    private String sanitizeFilename(String filename) {
        return filename.replaceAll("[^0-9a-zA-Z_\\-.\\s]", "");
    }
}
