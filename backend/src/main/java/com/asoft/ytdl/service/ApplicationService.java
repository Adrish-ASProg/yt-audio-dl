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
import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;

import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.util.*;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

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
            response.setStatus(HttpServletResponse.SC_OK);
            FileCopyUtils.copy(in, response.getOutputStream());
        } catch (IOException e) {
            e.printStackTrace();
            System.err.println("[AppService.downloadFile] IOException, see logs above");
        }
    }

    /**
     * POST /dl-zip
     **/
    public void downloadFiles(List<String> uuids, HttpServletResponse response) {
        ArrayList<File> filesToBeZipped = new ArrayList<>();

        /*
        Filter uuids, keep only:
         - file's uuid present in "fileStatus"
         - fileStatus with COMPLETED status
         - Existing files on disk
        */
        uuids.stream()
                .filter(filesStatus::containsKey)
                .map(filesStatus::get)
                .filter(fs -> ProgressStatus.COMPLETED.equals(fs.getStatus()))
                // FIXME extension
                .map(fileStatus -> new File(DOWNLOAD_FOLDER + File.separator + fileStatus.getName() + ".mp3"))
                .filter(File::exists)
                .forEach(filesToBeZipped::add);

        try (ZipOutputStream zipOutputStream = new ZipOutputStream(response.getOutputStream())) {

            // Package files into zip
            for (File file : filesToBeZipped) {
                zipOutputStream.putNextEntry(new ZipEntry(file.getName()));
                FileInputStream fileInputStream = new FileInputStream(file);

                IOUtils.copy(fileInputStream, zipOutputStream);

                fileInputStream.close();
                zipOutputStream.closeEntry();
            }

            //setting headers
            response.addHeader("Content-Disposition", "attachment; filename=\"yt-audio-dl.zip\"");
            response.setStatus(HttpServletResponse.SC_OK);
        } catch (IOException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
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
    public boolean deleteFiles(List<String> uuids) throws FileNotFoundException {
        boolean allFilesDeleted = true;

        // Keep only ERRORED or COMPLETED fileStatus
        uuids = uuids.stream()
                .filter(filesStatus::containsKey)
                .map(filesStatus::get)
                .filter(fileStatus -> ProgressStatus.ERROR.equals(fileStatus.getStatus())
                        || ProgressStatus.COMPLETED.equals(fileStatus.getStatus()))
                .map(FileStatus::getUuid)
                .collect(Collectors.toList());

        for (String uuid : uuids) {
            FileStatus fs = filesStatus.get(uuid);

            // Retrieve filename
            File f = FileUtils.getFile(DOWNLOAD_FOLDER + File.separator + fs.getFileName());

            // Status completed -> Rm from memory / rm from disk
            if (ProgressStatus.COMPLETED.equals(fs.getStatus())) {
                boolean result = FileUtils.deleteFile(f);
                if (result) filesStatus.remove(uuid);
                allFilesDeleted = allFilesDeleted && result;
            }

            // Status error -> Rm from memory only
            else if (ProgressStatus.ERROR.equals(fs.getStatus())) {
                filesStatus.remove(uuid);
            }
        }

        return allFilesDeleted;
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
