package com.asoft.ytdl.service;

import com.asoft.ytdl.constants.Constants;
import com.asoft.ytdl.constants.enums.ProgressStatus;
import com.asoft.ytdl.constants.interfaces.DownloadFromYTEvents;
import com.asoft.ytdl.exception.NotFoundException;
import com.asoft.ytdl.exception.UncompletedDownloadException;
import com.asoft.ytdl.exception.YTDLException;
import com.asoft.ytdl.model.FileStatus;
import com.asoft.ytdl.model.Mp3Metadata;
import com.asoft.ytdl.model.request.DLFileAsZipRequest;
import com.asoft.ytdl.model.request.DLFromYTRequest;
import com.asoft.ytdl.model.request.FileStatusRequest;
import com.asoft.ytdl.model.request.FileStatusResponse;
import com.asoft.ytdl.model.request.TagRequest;
import com.asoft.ytdl.model.request.VideoInfo;
import com.asoft.ytdl.properties.DirectoryProperties;
import com.asoft.ytdl.utils.FileUtils;
import com.asoft.ytdl.utils.Mp3Tagger;
import com.asoft.ytdl.utils.YTDownloadManager;
import com.mpatric.mp3agic.NotSupportedException;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static com.asoft.ytdl.utils.FileUtils.getFile;
import static org.apache.commons.collections.CollectionUtils.isEmpty;

@Service
public class ApplicationService implements DownloadFromYTEvents {

    @Value("${updateYtdl}")
    private Boolean updateYtDl;

    private final YTDownloadManager dlManager;
    private final Map<String, FileStatus> filesStatus;
    private final DirectoryProperties directoryProperties;

    ApplicationService(final DirectoryProperties directoryProperties) {
        this.directoryProperties = directoryProperties;

        dlManager = new YTDownloadManager(this);

        filesStatus = getAudioFiles();

        System.out.println(filesStatus.size() + " files retrieved");
    }

    @PostConstruct
    void updateYtDlVersion() {
        if (Boolean.TRUE.equals(updateYtDl))
            dlManager.updateYtDlVersion();
        dlManager.printYtDlVersion();
    }

    public List<FileStatus> getFilesStatus() {
        return new ArrayList<>(filesStatus.values());
    }

    //region Requests handler

    /**
     * POST /ytdl
     **/
    public List<VideoInfo> downloadYTVideoFromUrl(final DLFromYTRequest request) {
        var videoInfos = dlManager.getVideoInfos(request.getUrl());

        if (videoInfos.size() == 0) {
            throw new YTDLException("Unable to download file: No video found");
        }

        // Allows picking specific videos rather than downloading them all
        if (Boolean.TRUE.equals(request.getSelectFiles())) {
            return videoInfos;
        }

        downloadYTVideoFromIds(videoInfos);

        return null;
    }

    public void downloadYTVideoFromIds(final List<VideoInfo> videoInfos) {

        var filesStatusToDl = videoInfos.stream()
                .filter(info -> !filesStatus.containsKey(info.getId()))
                .map(info -> buildFileStatus(info.getId(), info.getTitle()))
                .collect(Collectors.toList());

        filesStatusToDl.forEach(fs -> filesStatus.put(fs.getId(), fs));
        dlManager.download(filesStatusToDl, new File(directoryProperties.getAudioDirectory()));
    }

    /**
     * POST /dl
     **/
    public void downloadFile(String id, HttpServletResponse response) throws IOException {
        checkFileIsCompleted(id);

        var fileStatus = filesStatus.get(id);
        var file = getFile(fileStatus.getAbsolutePath());
        returnFile(file, response, true);
    }

    /**
     * POST /dl-zip
     **/
    public void downloadFiles(DLFileAsZipRequest request, HttpServletResponse response) {
        var filesToBeZipped = new ArrayList<File>();

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
                .forEach(filesToBeZipped::add);

        if (isEmpty(filesToBeZipped)) {
            throw new NotFoundException("No files found to zip. You may want to refresh your files list");
        }

        try (ZipOutputStream zipOutputStream = new ZipOutputStream(response.getOutputStream())) {

            int zippedFilesCount = 0;
            // Package files into zip
            for (File file : filesToBeZipped) {
                System.out.println("Zipping " + file.getName());
                zipOutputStream.putNextEntry(new ZipEntry(file.getName()));
                var fileInputStream = new FileInputStream(file);
                IOUtils.copy(fileInputStream, zipOutputStream);

                fileInputStream.close();
                zipOutputStream.closeEntry();
                System.out.printf("%s zipped (%d/%d)\n", file.getName(), ++zippedFilesCount, filesToBeZipped.size());
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
        checkFileIsCompleted(tag.getId());
        FileStatus fs = filesStatus.get(tag.getId());

        String fileName = fs.getAbsolutePath();
        String newFileName = directoryProperties.getAudioDirectory() + File.separator + tag.getName() + ".mp3";

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
    public void playSong(final String id, final HttpServletResponse response) throws IOException {
        checkFileIsCompleted(id);

        var fileStatus = filesStatus.get(id);
        var file = getFile(fileStatus.getAbsolutePath());
        returnFile(file, response, false);
    }

    //endregion


    //region Download from YT events

    public void onDownloadCompleted(String id, String fileName) {
        FileStatus fs = filesStatus.get(id);
        fs.setStatus(ProgressStatus.COMPLETED);
        // FIXME extension
        File file = new File(directoryProperties.getAudioDirectory() + File.separator + fs.getName() + ".mp3");
        fs.setMetadata(Mp3Tagger.getTags(file));
    }

    public void onError(String id, Exception error) {
        System.err.println("[AppService.downloadFileFromYT] " + error.getMessage());

        if (filesStatus.containsKey(id)) {
            System.err.println("[AppService.downloadFileFromYT] " + filesStatus.get(id));
            filesStatus.get(id).setStatus(ProgressStatus.ERROR);
        }
    }

    //endregion


    //region Private methods

    private FileStatus buildFileStatus(final String id,
                                       final String name) {
        return FileStatus.builder()
                .id(id)
                .name(name)
                .status(ProgressStatus.INITIALIZING)
                .startDate(new Date().getTime())
                .absolutePath(directoryProperties.getAudioDirectory() + File.separator + name + ".mp3")
                .build();
    }

    private void checkFileIsCompleted(String id) throws FileNotFoundException {
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

    private Map<String, FileStatus> getAudioFiles() {

        System.out.println("Retrieving musics..");

        return FileUtils.getAllFilesInDirectory(new File(directoryProperties.getAudioDirectory()))
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
        response.setHeader(HttpHeaders.CONTENT_LENGTH, String.valueOf(file.length()));
        response.setHeader(Constants.HttpHeader.FILE_NAME, file.getName());
        response.setHeader(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, Constants.HttpHeader.FILE_NAME);

        if (asAttachment) {
            response.setHeader("Content-Disposition", "attachment; filename=" + file.getName());
        }

        response.setStatus(HttpServletResponse.SC_OK);
        FileCopyUtils.copy(in, response.getOutputStream());
    }

    // endregion

}
