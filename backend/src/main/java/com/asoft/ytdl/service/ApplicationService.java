package com.asoft.ytdl.service;

import com.asoft.ytdl.constants.enums.ProgressStatus;
import com.asoft.ytdl.constants.interfaces.DownloadFromYTEvents;
import com.asoft.ytdl.exception.UncompletedDownloadException;
import com.asoft.ytdl.model.FileStatus;
import com.asoft.ytdl.model.Mp3Metadata;
import com.asoft.ytdl.model.XmlConfiguration;
import com.asoft.ytdl.model.request.DLFileAsZipRequest;
import com.asoft.ytdl.model.request.DLPlaylistRequest;
import com.asoft.ytdl.model.request.FileStatusRequest;
import com.asoft.ytdl.model.request.FileStatusResponse;
import com.asoft.ytdl.model.request.TagRequest;
import com.asoft.ytdl.ui.MainFrame;
import com.asoft.ytdl.utils.FileUtils;
import com.asoft.ytdl.utils.Mp3Tagger;
import com.asoft.ytdl.utils.XMLManager;
import com.asoft.ytdl.utils.YTDownloadManager;
import com.mpatric.mp3agic.NotSupportedException;
import org.apache.commons.lang3.StringUtils;
import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static com.asoft.ytdl.utils.FileUtils.getFile;

@Service
public class ApplicationService implements DownloadFromYTEvents {

    @Autowired(required = false)
    MainFrame mainFrame;

    private final XmlConfiguration config;
    private final YTDownloadManager dlManager;
    private final Map<String, FileStatus> filesStatus;

    ApplicationService() {
        config = XMLManager.read();

        dlManager = new YTDownloadManager(this);
        dlManager.printYtDlVersion();

        filesStatus = getExistingFiles();
    }

    //#region Requests handler

    /**
     * POST /ytdl
     **/
    public void downloadFileFromYT(String url) {
        dlManager.setSkippedId(new ArrayList<>(filesStatus.keySet()));
        dlManager.download(url, new File(config.getAudioFolder()));
    }

    /**
     * POST /dl
     **/
    public void downloadFile(String id, HttpServletResponse response) throws IOException, UncompletedDownloadException {
        checkFileIsCompleted(id);

        var fileStatus = filesStatus.get(id);
        var file = getFile(fileStatus.getAbsolutePath());
        returnFile(file, response, true);
    }

    /**
     * POST /dl-zip
     **/
    public void downloadFiles(DLFileAsZipRequest request, HttpServletResponse response) {
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
                .map(fileStatus -> new File(fileStatus.getAbsolutePath()))
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

            //setting headers
            response.addHeader("Content-Disposition", "attachment; filename=\"yt-audio-dl.zip\"");
            response.setStatus(HttpServletResponse.SC_OK);
        } catch (IOException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }

    }

    /**
     * POST /dl-playlist
     **/
    public void downloadPlaylist(DLPlaylistRequest request, HttpServletResponse response) {
        System.out.println("Creating playlist");

        /*
        Filter ids, keep only:
         - file's id present in "fileStatus"
         - fileStatus with COMPLETED status
         - Existing files on disk
        */
        String playlistText = request.getIds().stream()
                .filter(filesStatus::containsKey)
                .map(filesStatus::get)
                .filter(fs -> ProgressStatus.COMPLETED.equals(fs.getStatus()))
                .map(fileStatus -> new File(fileStatus.getAbsolutePath()))
                .filter(File::exists)
                .map(File::getName)
                .map(fileName -> request.getFilePath() + fileName)
                .collect(Collectors.joining("\n"));

        ServletOutputStream out = null;
        try {
            out = response.getOutputStream();
            out.println(playlistText);
            out.flush();
            out.close();
            System.out.println("Playlist created");

            //setting headers
            response.addHeader("Content-Disposition", "attachment; filename=\"yt-audio-dl.m3u8\"");
            response.setStatus(HttpServletResponse.SC_OK);
        } catch (IOException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /tags
     **/
    public Mp3Metadata setTags(TagRequest tag) throws IOException, NotSupportedException, UncompletedDownloadException {
        checkFileIsCompleted(tag.getId());
        FileStatus fs = filesStatus.get(tag.getId());

        String fileName = fs.getAbsolutePath();
        String newFileName = config.getAudioFolder() + File.separator + tag.getName() + ".mp3";

        // Set tags in file
        Mp3Tagger.setTags(new File(fileName), tag.getMetadata());
        fs.setMetadata(Mp3Tagger.getTags(new File(fileName)));

        // Rename file if needed
        if (!Objects.equals(fileName, newFileName)
                && FileUtils.renameFile(new File(fileName), newFileName)) {
            fs.setName(tag.getName());
            fs.setAbsolutePath(newFileName);
        }
        return fs.getMetadata();
    }

    /**
     * GET /status/all
     **/
    public Collection<FileStatus> getAllFilesStatus() {
        return this.filesStatus.values();
    }

    /**
     * POST /status/
     **/
    public FileStatusResponse getFilesStatus(final FileStatusRequest request) {
        var filteredList = this.filesStatus.values().stream()
                .sorted(request.sortingModeComparator())
                .filter(fs -> StringUtils.containsIgnoreCase(fs.getName(), request.getFilter()))
                .collect(Collectors.toList());

        var paginatedList = filteredList.stream()
                .skip((long) request.getPageIndex() * request.getPageSize())
                .limit(request.getPageSize())
                .collect(Collectors.toList());

        return FileStatusResponse.builder()
                .filesStatus(paginatedList)
                .totalLength(filteredList.size())
                .build();
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
            File f = FileUtils.getFile(fs.getAbsolutePath());

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

    /**
     * POST /play
     **/
    public void playSong(final String id,
                           final HttpServletResponse response) throws IOException, UncompletedDownloadException {
        checkFileIsCompleted(id);

        var fileStatus = filesStatus.get(id);
        var file = getFile(fileStatus.getAbsolutePath());
        returnFile(file, response, false);
    }

    // #endregion


    //#region Download from YT events

    public void onProgress(String id, ProgressStatus progressStatus) {
        if (filesStatus.containsKey(id) && !progressStatus.equals(filesStatus.get(id).getStatus())) {
            filesStatus.get(id).setStatus(progressStatus);
        }
    }

    public void onDownloadCompleted(String id, String fileName) {
        FileStatus fs = filesStatus.get(id);
        fs.setStatus(ProgressStatus.COMPLETED);
        // FIXME extension
        File file = new File(config.getAudioFolder() + File.separator + fs.getName() + ".mp3");
        fs.setMetadata(Mp3Tagger.getTags(file));
    }

    public void onTitleRetrieved(String id, String title) {
        if (!filesStatus.containsKey(id)) {
            filesStatus.put(id, FileStatus.builder()
                    .id(id)
                    .name(title)
                    .status(ProgressStatus.INITIALIZING)
                    .startDate(new Date().getTime())
                    .absolutePath(config.getAudioFolder() + File.separator + title + ".mp3")
                    .build()
            );
        }
    }

    public void onError(String id, Exception error) {
        System.err.println("[AppService.downloadFileFromYT] " + error.getMessage());

        if (filesStatus.containsKey(id)) {
            System.err.println("[AppService.downloadFileFromYT] " + filesStatus.get(id));
            filesStatus.get(id).setStatus(ProgressStatus.ERROR);
        }
    }

    // #endregion


    //#region Private methods

    private void checkFileIsCompleted(String id) throws FileNotFoundException, UncompletedDownloadException {
        // ID not found
        if (!filesStatus.containsKey(id)) {
            throw new FileNotFoundException("Unable to find file with id « " + id + " »");
        }

        var fileStatus = filesStatus.get(id);

        // File not downloaded yet
        if (fileStatus.getStatus() != ProgressStatus.COMPLETED) {
            throw new UncompletedDownloadException("File not downloaded yet. Current status: " + fileStatus.getStatus());
        }
    }

    private Map<String, FileStatus> getExistingFiles() {

        System.out.println("Retrieving files..");

        return FileUtils.getAllFilesInDirectory(new File(config.getAudioFolder()))
                .stream()
                .filter(f -> f.getName().endsWith(".mp3"))
                .map(f -> FileStatus.builder()
                        .id(UUID.randomUUID().toString())
                        .status(ProgressStatus.COMPLETED)
                        .name(f.getName().replace(".mp3", ""))
                        .metadata(Mp3Tagger.getTags(f))
                        .startDate(FileUtils.getCreationDate(f))
                        .absolutePath(f.getAbsolutePath())
                        .build())
                .collect(Collectors.toMap(FileStatus::getId, Function.identity()));
    }

    private void returnFile(final File file, final HttpServletResponse response,
                            final boolean asAttachment) throws IOException {

        var in = new FileInputStream(file);
        response.setContentType("audio/mpeg");
        response.setHeader("Content-Length", String.valueOf(file.length()));
        response.setHeader("FileName", file.getName());

        if (asAttachment) {
            response.setHeader("Content-Disposition", "attachment; filename=" + file.getName());
        }

        response.setStatus(HttpServletResponse.SC_OK);
        FileCopyUtils.copy(in, response.getOutputStream());
    }

    // #endregion

}
