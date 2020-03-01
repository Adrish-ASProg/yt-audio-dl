package com.asoft.ytdl.controller;

import com.asoft.ytdl.exception.UncompletedDownloadException;
import com.asoft.ytdl.exception.YTDLException;
import com.asoft.ytdl.model.FileStatus;
import com.asoft.ytdl.model.Mp3Metadata;
import com.asoft.ytdl.model.request.DLFileAsZipRequest;
import com.asoft.ytdl.model.request.DLFileRequest;
import com.asoft.ytdl.model.request.DLFromYTRequest;
import com.asoft.ytdl.model.request.TagRequest;
import com.asoft.ytdl.service.ApplicationService;
import com.mpatric.mp3agic.NotSupportedException;
import org.apache.commons.validator.routines.UrlValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Collection;
import java.util.List;

@RestController
public class FileController {

    @Autowired
    ApplicationService applicationService;


    @RequestMapping(value = "/ytdl", method = RequestMethod.POST)
    public ResponseEntity<Void> downloadFromYT(@RequestBody DLFromYTRequest request) throws YTDLException {
        String url = request.getUrl();
        if (url == null || !new UrlValidator(new String[]{"http", "https"}).isValid(url)) throw new YTDLException("Invalid URL");

        applicationService.downloadFileFromYT(url);
        return new ResponseEntity<>(HttpStatus.ACCEPTED);
    }


    @RequestMapping(value = "/dl", method = RequestMethod.POST, produces = "audio/mpeg")
    public @ResponseBody
    void download(HttpServletResponse response, @RequestBody DLFileRequest request)
            throws FileNotFoundException, UncompletedDownloadException {
        applicationService.downloadFile(request.getId(), response);
    }

    @RequestMapping(value = "/dl-zip", method = RequestMethod.POST, produces = "application/zip")
    public void downloadAsZip(HttpServletResponse response, @RequestBody DLFileAsZipRequest request) {
        applicationService.downloadFiles(request, response);
    }


    @RequestMapping(value = "/status/all", method = RequestMethod.GET)
    public ResponseEntity<Collection<FileStatus>> statusAll() {
        return new ResponseEntity<>(applicationService.getAllFilesStatus(), HttpStatus.OK);
    }


    @RequestMapping(value = "/tags", method = RequestMethod.POST)
    public ResponseEntity<Mp3Metadata> setTags(@RequestBody TagRequest tags) throws IOException, NotSupportedException {
        return new ResponseEntity<>(applicationService.setTags(tags), HttpStatus.OK);
    }


    @RequestMapping(value = "/delete", method = RequestMethod.POST)
    public ResponseEntity<Boolean> delete(@RequestBody List<String> ids) throws FileNotFoundException {
        return new ResponseEntity<>(applicationService.deleteFiles(ids), HttpStatus.OK);
    }


    @RequestMapping(value = "/test")
    public ResponseEntity<Object> test() {
        return new ResponseEntity<>("Test page is working", HttpStatus.OK);
    }
}
