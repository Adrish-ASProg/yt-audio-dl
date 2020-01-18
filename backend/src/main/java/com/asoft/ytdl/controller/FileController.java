package com.asoft.ytdl.controller;

import com.asoft.ytdl.utils.DownloadManager;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.FileCopyUtils;
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

@RestController
public class FileController {

    private Map<String, DownloadManager.ProgressStatus> downloadedFilesStatus = new HashMap<>();
    private Map<String, String> downloadedFilesName = new HashMap<>();

    @RequestMapping(value = "/test")
    public ResponseEntity<Object> test() {
        return new ResponseEntity<>("Test page is working", HttpStatus.OK);
    }


    @RequestMapping(value = "/convert", method = RequestMethod.GET)
    public ResponseEntity<String> convert(@RequestParam(value = "url") String url) {
        UUID uuid = UUID.randomUUID();
        DownloadManager ytManager = new DownloadManager() {
            @Override
            public void log(String output, boolean isError) {
                if (isError) System.err.println(output);
                else System.out.println(output);
            }

            @Override
            public void onDownloadCompleted(String fileName) {
                downloadedFilesStatus.put(uuid.toString(), ProgressStatus.COMPLETED);
                downloadedFilesName.put(uuid.toString(), fileName);
            }

            @Override
            public void onProgress(ProgressStatus progressStatus) {
                downloadedFilesStatus.put(uuid.toString(), progressStatus);
            }
        };
        ytManager.download(url, true, "mp3");
        return new ResponseEntity<>(uuid.toString(), HttpStatus.ACCEPTED);
    }


    @RequestMapping(value = "/download", method = RequestMethod.GET, produces = "audio/mpeg")
    public @ResponseBody
    void download(HttpServletResponse response, @RequestParam(value = "uuid") String uuid) throws FileNotFoundException {
        if (!downloadedFilesStatus.containsKey(uuid)) {
            throw new FileNotFoundException("Unable to find file with uuid « " + uuid + " »");
        }
        // Still an enum -> not downloaded yet
        else if (downloadedFilesStatus.get(uuid) != DownloadManager.ProgressStatus.COMPLETED) {
            throw new FileNotFoundException("File not downloaded yet. Current status: " + downloadedFilesStatus.get(uuid));
        }

        try {
            // File file = getFile("src/main/resources/Tyga - LLW.mp3");
            File file = getFile(downloadedFilesName.get(uuid));
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

    @RequestMapping(value = "/status", method = RequestMethod.GET)
    public ResponseEntity<String> status(@RequestParam(value = "uuid") String uuid) throws FileNotFoundException {
        if (!downloadedFilesStatus.containsKey(uuid)) {
            throw new FileNotFoundException("Unable to find file with uuid « " + uuid + " »");
        }
        
        return new ResponseEntity<>(downloadedFilesStatus.get(uuid).toString(), HttpStatus.ACCEPTED);
    }

    private File getFile(String filePath) throws FileNotFoundException {
        File file = new File(filePath);
        if (!file.exists()) {
            throw new FileNotFoundException("file with path: " + file.getAbsolutePath() + " was not found.");
        }
        return file;
    }
}
