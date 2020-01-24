package com.asoft.ytdl.service;

import com.asoft.ytdl.enums.ProgressStatus;
import com.asoft.ytdl.exception.UncompletedDownloadException;
import com.asoft.ytdl.model.ConvertRequest;
import com.asoft.ytdl.model.FileStatus;
import com.asoft.ytdl.utils.DownloadManager;
import com.asoft.ytdl.utils.FileUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
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

    /**
     * /convert
     **/
    public void convertFile(ConvertRequest convertRequest) {
        Thread downloadThread = new Thread(() -> {
            DownloadManager dlManager = new DownloadManager();
            dlManager.setProgressEvent((uuid, progressStatus) -> {
                if (!filesStatus.containsKey(uuid)) {
                    filesStatus.put(uuid,
                            new FileStatus() {{
                                setUuid(uuid);
                                setName("N/A");
                                setStatus(progressStatus);
                                setStartDate(new Date().getTime());
                            }}
                    );
                }
                filesStatus.get(uuid).setStatus(progressStatus);
            });
            dlManager.setDownloadCompletedEvent((uuid, fileName) -> {
                FileStatus fs = filesStatus.get(uuid);
                fs.setStatus(ProgressStatus.COMPLETED);
                fs.setName(fileName);
            });
            dlManager.download(convertRequest.getUrl(), convertRequest.getAudioOnly());
        });

        downloadThread.setUncaughtExceptionHandler((thread, e) -> {
            if (e.getMessage().contains("|")) {
                String uuid = e.getMessage().substring(0, e.getMessage().indexOf("|"));
                if (filesStatus.containsKey(uuid)) {
                    filesStatus.get(uuid).setStatus(ProgressStatus.ERROR);
                }
            }
        });
        downloadThread.start();
    }

    /**
     * /status/{uuid}
     **/
    public FileStatus getFileStatus(String uuid) throws FileNotFoundException {
        if (!filesStatus.containsKey(uuid)) {
            throw new FileNotFoundException("Unable to find file with uuid « " + uuid + " »");
        }

        return filesStatus.get(uuid);
    }

    /**
     * /status/all
     **/
    public Collection<FileStatus> getAllFilesStatus() {
        return this.filesStatus.values();
    }

    /**
     * /download
     **/
    public void downloadFile(String uuid, HttpServletResponse response) throws FileNotFoundException, UncompletedDownloadException {
        // UUID not found
        if (!filesStatus.containsKey(uuid)) {
            throw new FileNotFoundException("Unable to find file with uuid « " + uuid + " »");
        }

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
}
