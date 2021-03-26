package com.asoft.ytdl.service;

import com.asoft.ytdl.constants.enums.ProgressStatus;
import com.asoft.ytdl.constants.interfaces.DownloadFromYTEvents;
import com.asoft.ytdl.exception.BadRequestException;
import com.asoft.ytdl.exception.UncompletedDownloadException;
import com.asoft.ytdl.model.FileStatus;
import com.asoft.ytdl.model.Mp3Metadata;
import com.asoft.ytdl.model.XmlConfiguration;
import com.asoft.ytdl.model.request.DLFileAsZipRequest;
import com.asoft.ytdl.model.request.DLPlaylistRequest;
import com.asoft.ytdl.model.request.TagRequest;
import com.asoft.ytdl.ui.MainFrame;
import com.asoft.ytdl.utils.*;
import com.mpatric.mp3agic.NotSupportedException;
import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static com.asoft.ytdl.utils.FileUtils.getFile;

@Service
public class ApplicationService implements DownloadFromYTEvents {

    @Autowired(required = false)
    MainFrame mainFrame;

    private XmlConfiguration config;
    private Map<String, FileStatus> filesStatus;

    ApplicationService() {
        config = XMLManager.read();
        filesStatus = getExistingFiles();
    }

    //#region Requests handler

    /**
     * POST /upload
     */
    public String uploadFile(MultipartFile file, boolean handleMissingFiles) throws BadRequestException, IOException {
        JSONObject response = new JSONObject();

        // Null or empty file
        if (file == null || file.isEmpty()) throw new BadRequestException("FileObject is null or empty");

        String fileName = file.getOriginalFilename();
        boolean fileIsSong = fileName != null && fileName.toLowerCase().endsWith(".mp3");
        boolean fileIsPlaylist = fileName != null && fileName.toLowerCase().endsWith(".m3u8");

        // Extension check
        if (!fileIsSong && !fileIsPlaylist) throw new BadRequestException("Bad file format, only mp3 and m3u8 are allowed");

        // Save file
        String destinationFolder = fileIsPlaylist ? config.getPlaylistFolder() : config.getAudioFolder();
        destinationFolder += File.separator;
        String saveError = FileUtils.saveFile(file, destinationFolder, file.getOriginalFilename(), true);

        // Error during save
        if (!saveError.equals("")) throw new BadRequestException(saveError);

        response.put("status", "success");
        response.put("message", "File saved successfully");

        // Retrieve missing files if provided file is a playlist
        if (handleMissingFiles && file.getOriginalFilename().toLowerCase().endsWith(".m3u8")) {

            // Replace path in playlist
            String filePath = destinationFolder + file.getOriginalFilename();

            // Retrieve missing files
            var missingFiles = new JSONArray(PlaylistUtils.processPlaylist(filePath, config.getOutputFolder()));
            response.put("status", "success");
            response.put("missingFiles", missingFiles);
        }

        if (mainFrame != null) mainFrame.log("File " + fileName + " saved");

        return response.toString();
    }

    /**
     * POST /ytdl
     **/
    public void downloadFileFromYT(String url) {
        YTDownloadManager dlManager = new YTDownloadManager(this);
        dlManager.setSkippedId(new ArrayList<>(filesStatus.keySet()));
        dlManager.download(url, new File(config.getAudioFolder()));
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
            File file = getFile(fileStatus.getAbsolutePath());
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
    public Mp3Metadata setTags(TagRequest tag) throws IOException, NotSupportedException {
        checkFileIsPresent(tag.getId());
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

    private void checkFileIsPresent(String id) throws FileNotFoundException {
        // ID not found
        if (!filesStatus.containsKey(id)) {
            throw new FileNotFoundException("Unable to find file with id « " + id + " »");
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

    // #endregion

}
