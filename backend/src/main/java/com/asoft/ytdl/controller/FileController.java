package com.asoft.ytdl.controller;

import com.asoft.ytdl.enums.ProgressStatus;
import com.asoft.ytdl.model.ConvertRequest;
import com.asoft.ytdl.model.FileStatus;
import com.asoft.ytdl.utils.DownloadManager;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static com.asoft.ytdl.utils.FileUtils.getFile;

@RestController
public class FileController {

    private Map<String, FileStatus> filesStatus = new HashMap<>();

    @RequestMapping(value = "/convert", method = RequestMethod.POST)
    public ResponseEntity<String> convert(@RequestBody ConvertRequest convertRequest) {
        UUID uuid = UUID.randomUUID();

        filesStatus.put(uuid.toString(),
                new FileStatus() {{ setUuid(uuid.toString()); }}
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

        return new ResponseEntity<>(uuid.toString(), HttpStatus.ACCEPTED);
    }


    @RequestMapping(value = "/download", method = RequestMethod.GET, produces = "audio/mpeg")
    public @ResponseBody
    void download(HttpServletResponse response, @RequestParam(value = "uuid") String uuid)
            throws FileNotFoundException {

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
            File file = getFile(fileStatus.getName());
            InputStream in = new FileInputStream(file);
            response.setContentType("audio/mpeg");
            response.setHeader("Content-Disposition", "attachment; filename=" + file.getName());
            response.setHeader("Content-Length", String.valueOf(file.length()));
            FileCopyUtils.copy(in, response.getOutputStream());
        } catch (IOException e) {
            System.err.println("IOException, see logs below");
            e.printStackTrace();
        }
    }


    //#region Status Endpoints

    @RequestMapping(value = "/status", method = RequestMethod.GET)
    public ResponseEntity<FileStatus> status(@RequestParam(value = "uuid") String uuid) throws FileNotFoundException {
        if (!filesStatus.containsKey(uuid)) {
            throw new FileNotFoundException("Unable to find file with uuid « " + uuid + " »");
        }

        return new ResponseEntity<>(filesStatus.get(uuid), HttpStatus.ACCEPTED);
    }

    @RequestMapping(value = "/status/all", method = RequestMethod.GET)
    public ResponseEntity<Map<String, FileStatus>> statusAll() {
        return new ResponseEntity<>(filesStatus, HttpStatus.ACCEPTED);
    }

    // #endregion


    @RequestMapping(value = "/test")
    public ResponseEntity<Object> test() {
        return new ResponseEntity<>("Test page is working", HttpStatus.OK);
    }
}
