package com.asoft.ytdl.controller;

import com.asoft.ytdl.model.ConvertRequest;
import com.asoft.ytdl.model.FileStatus;
import com.asoft.ytdl.service.ApplicationService;
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
import java.util.Collection;
import java.util.Collections;

@RestController
public class FileController {

    @Autowired
    ApplicationService applicationService;

    @RequestMapping(value = "/convert", method = RequestMethod.POST)
    public ResponseEntity<Object> convert(@RequestBody ConvertRequest convertRequest) {
        String uuid = applicationService.convertFile(convertRequest);
        return new ResponseEntity<>(Collections.singletonMap("uuid", uuid), HttpStatus.ACCEPTED);
    }


    @RequestMapping(value = "/download", method = RequestMethod.GET, produces = "audio/mpeg")
    public @ResponseBody
    void download(HttpServletResponse response, @RequestParam(value = "uuid") String uuid)
            throws FileNotFoundException {
        applicationService.downloadFile(uuid, response);
    }


    //#region Status Endpoints

    @RequestMapping(value = "/status", method = RequestMethod.GET)
    public ResponseEntity<FileStatus> status(@RequestParam(value = "uuid") String uuid) throws FileNotFoundException {
        return new ResponseEntity<>(applicationService.getFileStatus(uuid), HttpStatus.ACCEPTED);
    }

    @RequestMapping(value = "/status/all", method = RequestMethod.GET)
    public ResponseEntity<Collection<FileStatus>> statusAll() {
        return new ResponseEntity<>(applicationService.getAllFilesStatus(), HttpStatus.ACCEPTED);
    }

    // #endregion


    @RequestMapping(value = "/test")
    public ResponseEntity<Object> test() {
        return new ResponseEntity<>("Test page is working", HttpStatus.OK);
    }
}
