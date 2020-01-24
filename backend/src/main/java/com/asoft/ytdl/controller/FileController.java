package com.asoft.ytdl.controller;

import com.asoft.ytdl.exception.UncompletedDownloadException;
import com.asoft.ytdl.model.FileStatus;
import com.asoft.ytdl.model.Tag;
import com.asoft.ytdl.model.YTRequest;
import com.asoft.ytdl.service.ApplicationService;
import com.mpatric.mp3agic.NotSupportedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.util.Collection;

@RestController
public class FileController {

    @Autowired
    ApplicationService applicationService;

    @RequestMapping(value = "/ytdl", method = RequestMethod.POST)
    public ResponseEntity<Void> downloadFromYT(@RequestBody YTRequest ytRequest) {
        applicationService.downloadFileFromYT(ytRequest);
        return new ResponseEntity<>(HttpStatus.ACCEPTED);
    }


    @RequestMapping(value = "/dl", method = RequestMethod.GET, produces = "audio/mpeg")
    public @ResponseBody
    void download(HttpServletResponse response, @RequestParam(value = "uuid") String uuid)
            throws FileNotFoundException, UncompletedDownloadException {
        applicationService.downloadFile(uuid, response);
    }


    @RequestMapping(value = "/tag", method = RequestMethod.POST)
    public ResponseEntity<Void> setTag(@RequestParam(value = "uuid") String uuid,
                                       @RequestBody Tag tag) throws InvocationTargetException, IOException, IllegalAccessException, NoSuchMethodException, NotSupportedException {
        applicationService.setTag(uuid, tag);
        return new ResponseEntity<>(HttpStatus.ACCEPTED);
    }


    @RequestMapping(value = "/status", method = RequestMethod.GET)
    public ResponseEntity<FileStatus> status(@RequestParam(value = "uuid") String uuid) throws FileNotFoundException {
        return new ResponseEntity<>(applicationService.getFileStatus(uuid), HttpStatus.ACCEPTED);
    }


    @RequestMapping(value = "/status/all", method = RequestMethod.GET)
    public ResponseEntity<Collection<FileStatus>> statusAll() {
        return new ResponseEntity<>(applicationService.getAllFilesStatus(), HttpStatus.ACCEPTED);
    }


    @RequestMapping(value = "/test")
    public ResponseEntity<Object> test() {
        return new ResponseEntity<>("Test page is working", HttpStatus.OK);
    }
}
