package com.asoft.ytdl.service;

import com.asoft.ytdl.application.Mp3Tagger;
import com.asoft.ytdl.enums.ProgressStatus;
import com.asoft.ytdl.exception.UncompletedDownloadException;
import com.asoft.ytdl.model.*;
import com.asoft.ytdl.utils.FileUtils;
import com.asoft.ytdl.utils.SettingsManager;
import com.asoft.ytdl.utils.XMLManager;
import com.asoft.ytdl.utils.YTDownloadManager;
import com.mpatric.mp3agic.NotSupportedException;
import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;
import org.springframework.util.StringUtils;

import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static com.asoft.ytdl.utils.FileUtils.getFile;
import static com.asoft.ytdl.utils.SettingsManager.DOWNLOAD_FOLDER;

@Service
public class ApplicationService {

    private Map<String, FileStatus> filesStatus = new HashMap<>();

    ApplicationService() {
        SettingsManager.initialize();
        var config = XMLManager.read();
        if (config != null && config.getFilesData() != null) {
            filesStatus = config.getFilesData().stream().collect(Collectors.toMap(FileStatus::getId, Function.identity()));
        }
    }

    //#region Requests handler

    /**
     * POST /ytdl
     **/
    public void downloadFileFromYT(YTRequest ytRequest) {
        YTDownloadManager dlManager = new YTDownloadManager();
        dlManager.setProgressEvent((id, progressStatus) -> {
            if (filesStatus.containsKey(id) && !progressStatus.equals(filesStatus.get(id).getStatus())) {
                filesStatus.get(id).setStatus(progressStatus);
                saveData();
            }
        });
        dlManager.setDownloadCompletedEvent((id, fileName) -> {
            FileStatus fs = filesStatus.get(id);
            fs.setStatus(ProgressStatus.COMPLETED);
            // FIXME extension
            fs.setMetadata(Mp3Tagger.getTags(DOWNLOAD_FOLDER + File.separator + fs.getName() + ".mp3"));
            saveData();
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
                saveData();
            }
        });
        dlManager.setErrorEvent((id, error) -> {
            System.err.println("[AppService.downloadFileFromYT] " + error.getMessage());

            if (filesStatus.containsKey(id)) {
                System.err.println("[AppService.downloadFileFromYT] " + filesStatus.get(id));
                filesStatus.get(id).setStatus(ProgressStatus.ERROR);
                saveData();
            }
        });
        dlManager.setSkippedId(new ArrayList<>(filesStatus.keySet()));
        dlManager.download(ytRequest.getUrl());
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

            int zippedFilesCount = 0;
            // Package files into zip
            for (Map.Entry<String, File> entry : filesToBeZipped.entrySet()) {
                System.out.println("Zipping " + entry.getKey());
                zipOutputStream.putNextEntry(new ZipEntry(entry.getKey()));
                FileInputStream fileInputStream = new FileInputStream(entry.getValue());

                IOUtils.copy(fileInputStream, zipOutputStream);

                fileInputStream.close();
                zipOutputStream.closeEntry();
                System.out.printf("%s zipped (%d/%d)\n", entry.getKey(), ++zippedFilesCount, filesToBeZipped.size());
            }

            // Include playlist if needed
            if (request.getCreatePlaylist() && !StringUtils.isEmpty(request.getFilePath())) {
                System.out.println("Creating playlist");
                String text = filesToBeZipped.keySet()
                        .stream()
                        .map(fileName -> request.getFilePath() + fileName)
                        .collect(Collectors.joining("\n"));

                InputStream inputStream = new ByteArrayInputStream(text.getBytes(StandardCharsets.UTF_8));
                zipOutputStream.putNextEntry(new ZipEntry("playlist.m3u8"));
                IOUtils.copy(inputStream, zipOutputStream);
                inputStream.close();
                zipOutputStream.closeEntry();
                System.out.println("Playlist created");
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

        saveData();

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

        saveData();

        return allFilesDeleted;
    }

    // #endregion

    //#region Private methods

    private void saveData() {
        var config = new XmlConfiguration();
        config.setFilesData(new ArrayList<>(filesStatus.values()));
        XMLManager.write(config);
    }

    private void checkFileIsPresent(String id) throws FileNotFoundException {
        // ID not found
        if (!filesStatus.containsKey(id)) {
            throw new FileNotFoundException("Unable to find file with id « " + id + " »");
        }
    }

    // #endregion

}
