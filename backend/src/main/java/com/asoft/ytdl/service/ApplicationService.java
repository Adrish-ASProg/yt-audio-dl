package com.asoft.ytdl.service;

import com.asoft.ytdl.application.Mp3Tagger;
import com.asoft.ytdl.enums.ProgressStatus;
import com.asoft.ytdl.exception.UncompletedDownloadException;
import com.asoft.ytdl.model.FileStatus;
import com.asoft.ytdl.model.Tag;
import com.asoft.ytdl.model.YTRequest;
import com.asoft.ytdl.utils.FileUtils;
import com.asoft.ytdl.utils.YTDownloadManager;
import com.mpatric.mp3agic.NotSupportedException;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static com.asoft.ytdl.utils.FileUtils.getFile;

@Service
public class ApplicationService {

    public final static String DOWNLOAD_FOLDER = "downloaded";
    private final Map<String, FileStatus> filesStatus = new HashMap<>();

    ApplicationService() {
        retrieveFilesOnDisk();
    }

    /**
     * POST /ytdl
     **/
    public void downloadFileFromYT(YTRequest ytRequest) {
        Thread downloadThread = new Thread(() -> {
            YTDownloadManager dlManager = new YTDownloadManager();
            dlManager.setProgressEvent((uuid, progressStatus) -> {
                if (filesStatus.containsKey(uuid)) {
                    filesStatus.get(uuid).setStatus(progressStatus);
                }
            });
            dlManager.setDownloadCompletedEvent((uuid, fileName) -> {
                FileStatus fs = filesStatus.get(uuid);
                fs.setStatus(ProgressStatus.COMPLETED);
                fs.setName(fileName);
            });
            dlManager.setTitleRetrievedEvent((uuid, title) -> {
                if (!filesStatus.containsKey(uuid)) {
                    filesStatus.put(uuid,
                            new FileStatus() {{
                                setUuid(uuid);
                                setName(title);
                                setStatus(ProgressStatus.INITIALIZING);
                                setStartDate(new Date().getTime());
                            }}
                    );
                    System.out.println("setTitleRetrievedEvent: " + filesStatus.get(uuid));
                }
            });
            dlManager.setErrorEvent((uuid, error) -> {
                System.err.println("[downloadFileFromYT] " + error.getMessage());

                if (filesStatus.containsKey(uuid)) {
                    System.err.println("\n[downloadFileFromYT] " + filesStatus.get(uuid));
                    filesStatus.get(uuid).setStatus(ProgressStatus.ERROR);
                }
            });
            dlManager.download(ytRequest.getUrl(), ytRequest.getAudioOnly());
        });

        downloadThread.setUncaughtExceptionHandler((thread, e) -> {
            System.err.println("[downloadFileFromYT] UncaughtExceptionHandler: " + e.getMessage());
        });
        downloadThread.start();
    }

    /**
     * POST /dl
     **/
    public void downloadFile(String uuid, HttpServletResponse response) throws FileNotFoundException, UncompletedDownloadException {
        checkFileIsPresent(uuid);

        FileStatus fileStatus = filesStatus.get(uuid);

        // File not downloaded yet
        if (fileStatus.getStatus() != ProgressStatus.COMPLETED) {
            throw new UncompletedDownloadException("File not downloaded yet. Current status: " + fileStatus.getStatus());
        }

        try {
            // FIXME extension
            File file = getFile(DOWNLOAD_FOLDER + File.separator + fileStatus.getName() + ".mp3");
            InputStream in = new FileInputStream(file);
            response.setContentType("audio/mpeg");
            response.setHeader("Content-Disposition", "attachment; filename=" + file.getName());
            response.setHeader("Content-Length", String.valueOf(file.length()));
            response.setHeader("FileName", fileStatus.getName() + ".mp3");
            FileCopyUtils.copy(in, response.getOutputStream());
        } catch (IOException e) {
            e.printStackTrace();
            System.err.println("IOException, see logs above");
        }
    }

    /**
     * POST /tag
     **/
    public void setTag(String uuid, Tag tag) throws IOException, NoSuchMethodException, InvocationTargetException, IllegalAccessException, NotSupportedException {
        checkFileIsPresent(uuid);

        // String filePath = DOWNLOAD_FOLDER + File.separator + filesStatus.get(uuid).getName() + ".mp3";
        String filePath = DOWNLOAD_FOLDER + File.separator + new ArrayList<>(filesStatus.values()).get(0).getName() + ".mp3";

        Mp3Tagger mp3Tagger = new Mp3Tagger();
        mp3Tagger.setTag(filePath, tag);
    }


    /**
     * GET /status
     **/
    public FileStatus getFileStatus(String uuid) throws FileNotFoundException {
        checkFileIsPresent(uuid);
        return filesStatus.get(uuid);
    }

    /**
     * GET /status/all
     **/
    public Collection<FileStatus> getAllFilesStatus() {
        return this.filesStatus.values();
    }


    //#region Private methods

    private void retrieveFilesOnDisk() {
        File downloadFolder;
        try {
            downloadFolder = getFile(DOWNLOAD_FOLDER);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            System.err.println("Unable to retrieve files in « " + DOWNLOAD_FOLDER + " » folder");
            return;
        }

        FileUtils.getAllFilesInDirectory(downloadFolder)
                .forEach(file -> {
                    UUID uuid = UUID.randomUUID();
                    filesStatus.put(uuid.toString(),
                            new FileStatus() {{
                                setUuid(uuid.toString());
                                setName(file.getName().replace(".mp3", ""));
                                setStatus(ProgressStatus.COMPLETED);
                                setStartDate(FileUtils.getCreationDate(file));
                            }}
                    );
                });

        System.out.println("Files in « " + DOWNLOAD_FOLDER + " » folder retrieved successfully");
    }

    private void checkFileIsPresent(String uuid) throws FileNotFoundException {
        // UUID not found
        if (!filesStatus.containsKey(uuid)) {
            throw new FileNotFoundException("Unable to find file with uuid « " + uuid + " »");
        }
    }

    // #endregion

}
