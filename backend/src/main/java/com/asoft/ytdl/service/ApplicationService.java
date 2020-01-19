package com.asoft.ytdl.service;

import com.asoft.ytdl.enums.ProgressStatus;
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
        try {
            retrieveFilesOnDisk();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            System.err.println("Unable to retrieve files in « " + DOWNLOAD_FOLDER + " » folder");
        }
    }

    private void retrieveFilesOnDisk() throws FileNotFoundException {

        FileUtils.getAllFilesInDirectory(getFile(DOWNLOAD_FOLDER))
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
    }

    public String convertFile(ConvertRequest convertRequest) {
        UUID uuid = UUID.randomUUID();

        filesStatus.put(uuid.toString(),
                new FileStatus() {{
                    setUuid(uuid.toString());
                    setName("N/A");
                    setStatus(ProgressStatus.INITIALIZING);
                    setStartDate(new Date().getTime());
                }}
        );

        DownloadManager ytManager = new DownloadManager() {
            @Override
            public void onProgress(ProgressStatus progressStatus) {
                filesStatus.get(uuid.toString()).setStatus(progressStatus);
            }

            @Override
            public void onDownloadCompleted(String fileName) {
                FileStatus fs = filesStatus.get(uuid.toString());
                fs.setStatus(ProgressStatus.COMPLETED);
                fs.setName(fileName);
            }
        };
        ytManager.download(convertRequest.getUrl(), convertRequest.getAudioOnly());

        return uuid.toString();
    }

    public FileStatus getFileStatus(String uuid) throws FileNotFoundException {
        if (!filesStatus.containsKey(uuid)) {
            throw new FileNotFoundException("Unable to find file with uuid « " + uuid + " »");
        }

        return filesStatus.get(uuid);
    }

    public Collection<FileStatus> getAllFilesStatus() {
        return this.filesStatus.values();
    }

    public void downloadFile(String uuid, HttpServletResponse response) throws FileNotFoundException {
        // UUID not found
        if (!filesStatus.containsKey(uuid)) {
            throw new FileNotFoundException("Unable to find file with uuid « " + uuid + " »");
        }

        FileStatus fileStatus = filesStatus.get(uuid);

        // File not downloaded yet
        if (fileStatus.getStatus() != ProgressStatus.COMPLETED) {
            throw new FileNotFoundException("File not downloaded yet. Current status: " + fileStatus.getStatus());
        }

        try {
            File file = getFile(DOWNLOAD_FOLDER + File.separator + fileStatus.getName() + ".mp3");
            InputStream in = new FileInputStream(file);
            response.setContentType("audio/mpeg");
            response.setHeader("Content-Disposition", "attachment; filename=" + file.getName());
            response.setHeader("Content-Length", String.valueOf(file.length()));
            response.setHeader("FileName", fileStatus.getName() + ".mp3");
            FileCopyUtils.copy(in, response.getOutputStream());
        } catch (IOException e) {
            System.err.println("IOException, see logs below");
            e.printStackTrace();
        }
    }
}
