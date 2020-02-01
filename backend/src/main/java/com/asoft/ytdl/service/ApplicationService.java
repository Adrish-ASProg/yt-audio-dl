package com.asoft.ytdl.service;

import com.asoft.ytdl.application.Mp3Tagger;
import com.asoft.ytdl.enums.ProgressStatus;
import com.asoft.ytdl.exception.UncompletedDownloadException;
import com.asoft.ytdl.model.FileStatus;
import com.asoft.ytdl.model.Mp3Metadata;
import com.asoft.ytdl.model.TagRequest;
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
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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
                fs.setMetadata(Mp3Tagger.getTags(DOWNLOAD_FOLDER + File.separator + fs.getFileName()));
            });
            dlManager.setTitleRetrievedEvent((uuid, title) -> {
                if (!filesStatus.containsKey(uuid)) {
                    filesStatus.put(uuid,
                            new FileStatus() {{
                                setUuid(uuid);
                                setName(title);
                                // FIXME extension
                                setFileName(title + ".mp3");
                                setStatus(ProgressStatus.INITIALIZING);
                                setStartDate(new Date().getTime());
                            }}
                    );
                }
            });
            dlManager.setErrorEvent((uuid, error) -> {
                System.err.println("[AppService.downloadFileFromYT] " + error.getMessage());

                if (filesStatus.containsKey(uuid)) {
                    System.err.println("[AppService.downloadFileFromYT] " + filesStatus.get(uuid));
                    filesStatus.get(uuid).setStatus(ProgressStatus.ERROR);
                }
            });
            dlManager.download(ytRequest.getUrl(), ytRequest.getAudioOnly());
        });

        downloadThread.setUncaughtExceptionHandler((thread, e) -> {
            System.err.println("[AppService.downloadFileFromYT] UncaughtExceptionHandler: " + e.getMessage());
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
            System.err.println("[AppService.downloadFile] IOException, see logs above");
        }
    }

    /**
     * POST /tags
     **/
    public Mp3Metadata setTags(TagRequest tag) throws IOException, NotSupportedException {
        checkFileIsPresent(tag.getUuid());
        FileStatus fs = filesStatus.get(tag.getUuid());

        String directory = DOWNLOAD_FOLDER + File.separator;
        String fileName = directory + fs.getName() + ".mp3";
        String newFileName = directory + tag.getName() + ".mp3";

        // Set tags in file
        Mp3Tagger.setTags(fileName, tag.getMetadata());
        fs.setMetadata(Mp3Tagger.getTags(fileName));

        // Rename file if needed
        if (!Objects.equals(fileName, newFileName)
                && FileUtils.renameFile(new File(fileName), newFileName))
            fs.setName(tag.getName());


        return fs.getMetadata();
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

    /**
     * DELETE /delete
     **/
    public void deleteFiles(List<String> uuids) throws FileNotFoundException {
        for (String uuid : uuids) {
            checkFileIsPresent(uuid);

            File f = FileUtils.getFile(DOWNLOAD_FOLDER + File.separator + filesStatus.get(uuid).getFileName());
            FileUtils.deleteFile(f);
            filesStatus.remove(uuid);
        }
    }


    //#region Private methods

    private void retrieveFilesOnDisk() {
        File downloadFolder;
        try {
            downloadFolder = getFile(DOWNLOAD_FOLDER);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            System.err.println("[AppService.retrieveFilesOnDisk] Unable to retrieve files in « " + DOWNLOAD_FOLDER + " » folder");
            return;
        }

        FileUtils.getAllFilesInDirectory(downloadFolder)
                .stream()
                .filter(file -> file.getName().endsWith(".mp3"))
                .forEach(file -> {
                    UUID uuid = UUID.randomUUID();
                    filesStatus.put(uuid.toString(),
                            new FileStatus() {{
                                setUuid(uuid.toString());
                                setFileName(file.getName());
                                setName(file.getName().replace(".mp3", ""));
                                setStatus(ProgressStatus.COMPLETED);
                                setStartDate(FileUtils.getCreationDate(file));
                                setMetadata(Mp3Tagger.getTags(DOWNLOAD_FOLDER + File.separator + file.getName()));
                            }}
                    );
                });
    }

    private void checkFileIsPresent(String uuid) throws FileNotFoundException {
        // UUID not found
        if (!filesStatus.containsKey(uuid)) {
            throw new FileNotFoundException("Unable to find file with uuid « " + uuid + " »");
        }
    }

    // #endregion

}
