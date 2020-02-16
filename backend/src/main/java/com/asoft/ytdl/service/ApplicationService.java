package com.asoft.ytdl.service;

import com.asoft.ytdl.application.Mp3Tagger;
import com.asoft.ytdl.enums.ProgressStatus;
import com.asoft.ytdl.exception.UncompletedDownloadException;
import com.asoft.ytdl.model.DLAsZipRequest;
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
import org.springframework.util.StringUtils;

import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
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
            dlManager.setProgressEvent((id, progressStatus) -> {
                if (filesStatus.containsKey(id) && !progressStatus.equals(filesStatus.get(id).getStatus())) {
                    filesStatus.get(id).setStatus(progressStatus);
                }
            });
            dlManager.setDownloadCompletedEvent((id, fileName) -> {
                FileStatus fs = filesStatus.get(id);
                fs.setStatus(ProgressStatus.COMPLETED);
                // FIXME extension
                fs.setMetadata(Mp3Tagger.getTags(DOWNLOAD_FOLDER + File.separator + fs.getName() + ".mp3"));
            });
            dlManager.setTitleRetrievedEvent((id, title) -> {
                if (!filesStatus.containsKey(id)) {
                    filesStatus.put(id,
                            new FileStatus() {{
                                setId(id);
                                setName(title);
                                setStatus(ProgressStatus.INITIALIZING);
                                setStartDate(new Date().getTime());
                            }}
                    );
                }
            });
            dlManager.setErrorEvent((id, error) -> {
                System.err.println("[AppService.downloadFileFromYT] " + error.getMessage());

                if (filesStatus.containsKey(id)) {
                    System.err.println("[AppService.downloadFileFromYT] " + filesStatus.get(id));
                    filesStatus.get(id).setStatus(ProgressStatus.ERROR);
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
    public void downloadFile(String id, HttpServletResponse response) throws FileNotFoundException, UncompletedDownloadException {
        checkFileIsPresent(id);

        FileStatus fileStatus = filesStatus.get(id);

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
    public void downloadFiles(DLAsZipRequest request, HttpServletResponse response) {
        Map<String, File> filesToBeZipped = new HashMap<>();

        /*
        Filter ids, keep only:
         - file's id present in "fileStatus"
         - fileStatus with COMPLETED status
         - Existing files on disk
        */
        request.getIds().stream()
                .filter(filesStatus::containsKey)
                .map(filesStatus::get)
                .filter(fs -> ProgressStatus.COMPLETED.equals(fs.getStatus()))
                // FIXME extension
                .map(fileStatus -> new File(DOWNLOAD_FOLDER + File.separator + fileStatus.getName() + ".mp3"))
                .filter(File::exists)
                .forEach(file -> filesToBeZipped.put(file.getName(), file));

        try (ZipOutputStream zipOutputStream = new ZipOutputStream(response.getOutputStream())) {

            // Package files into zip
            for (Map.Entry<String, File> entry : filesToBeZipped.entrySet()) {
                zipOutputStream.putNextEntry(new ZipEntry(entry.getKey()));
                FileInputStream fileInputStream = new FileInputStream(entry.getValue());

                IOUtils.copy(fileInputStream, zipOutputStream);

                fileInputStream.close();
                zipOutputStream.closeEntry();
            }

            // Include playlist if needed
            if (request.getCreatePlaylist() && !StringUtils.isEmpty(request.getFilePath())) {
                String text = filesToBeZipped.keySet()
                        .stream()
                        .map(fileName -> request.getFilePath() + fileName)
                        .collect(Collectors.joining("\n"));

                InputStream inputStream = new ByteArrayInputStream(text.getBytes(StandardCharsets.UTF_8));
                zipOutputStream.putNextEntry(new ZipEntry("playlist.m3u8"));
                IOUtils.copy(inputStream, zipOutputStream);
                inputStream.close();
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
        checkFileIsPresent(tag.getId());
        FileStatus fs = filesStatus.get(tag.getId());

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
    public FileStatus getFileStatus(String id) throws FileNotFoundException {
        checkFileIsPresent(id);
        return filesStatus.get(id);
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
    public boolean deleteFiles(List<String> ids) throws FileNotFoundException {
        boolean allFilesDeleted = true;

        // Keep only ERRORED or COMPLETED fileStatus
        ids = ids.stream()
                .filter(filesStatus::containsKey)
                .map(filesStatus::get)
                .filter(fileStatus -> ProgressStatus.ERROR.equals(fileStatus.getStatus())
                        || ProgressStatus.COMPLETED.equals(fileStatus.getStatus()))
                .map(FileStatus::getId)
                .collect(Collectors.toList());

        for (String id : ids) {
            FileStatus fs = filesStatus.get(id);

            // Retrieve filename
            File f = FileUtils.getFile(DOWNLOAD_FOLDER + File.separator + fs.getName() + ".mp3");

            // Status completed -> Rm from memory / rm from disk
            if (ProgressStatus.COMPLETED.equals(fs.getStatus())) {
                boolean result = FileUtils.deleteFile(f);
                if (result) filesStatus.remove(id);
                allFilesDeleted = allFilesDeleted && result;
            }

            // Status error -> Rm from memory only
            else if (ProgressStatus.ERROR.equals(fs.getStatus())) {
                filesStatus.remove(id);
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
                                setName(file.getName().replace(".mp3", ""));
                                setStatus(ProgressStatus.COMPLETED);
                                setStartDate(FileUtils.getCreationDate(file));
                                setMetadata(Mp3Tagger.getTags(DOWNLOAD_FOLDER + File.separator + file.getName()));
                            }}
                    );
                });
    }

    private void checkFileIsPresent(String id) throws FileNotFoundException {
        // ID not found
        if (!filesStatus.containsKey(id)) {
            throw new FileNotFoundException("Unable to find file with id « " + id + " »");
        }
    }

    // #endregion

}
