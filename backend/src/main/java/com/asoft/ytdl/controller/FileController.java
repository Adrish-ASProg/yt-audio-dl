package com.asoft.ytdl.controller;

import com.asoft.ytdl.exception.BadRequestException;
import com.asoft.ytdl.model.FileStatus;
import com.asoft.ytdl.model.Mp3Metadata;
import com.asoft.ytdl.model.request.DLFileAsZipRequest;
import com.asoft.ytdl.model.request.DLFileRequest;
import com.asoft.ytdl.model.request.DLFromYTRequest;
import com.asoft.ytdl.model.request.FileStatusRequest;
import com.asoft.ytdl.model.request.FileStatusResponse;
import com.asoft.ytdl.model.request.TagRequest;
import com.asoft.ytdl.model.request.VideoInfo;
import com.asoft.ytdl.service.ApplicationService;
import com.mpatric.mp3agic.NotSupportedException;
import lombok.RequiredArgsConstructor;
import org.apache.commons.validator.routines.UrlValidator;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Collection;
import java.util.List;

import static org.springframework.util.CollectionUtils.isEmpty;

@CrossOrigin
@ControllerAdvice
@RestController
@RequiredArgsConstructor
public class FileController {

    private final ApplicationService applicationService;


    //region ########## Download from YouTube ##########

    @RequestMapping(value = "/ytdl", method = RequestMethod.POST)
    public ResponseEntity<Collection<VideoInfo>> downloadYTVideoFromUrl(@RequestBody DLFromYTRequest request) {
        String url = request.getUrl();
        if (url == null || !new UrlValidator(new String[]{"http", "https"}).isValid(url)) throw new BadRequestException("Invalid URL");

        return new ResponseEntity<>(applicationService.downloadYTVideoFromUrl(request), HttpStatus.ACCEPTED);
    }

    @RequestMapping(value = "/ytdl-id", method = RequestMethod.POST)
    public ResponseEntity<Collection<VideoInfo>> downloadYTVideoFromIds(@RequestBody List<VideoInfo> request) {
        if (isEmpty(request) || request.stream().anyMatch(info -> StringUtils.isEmpty(info.getId()))) {
            throw new BadRequestException("Missing id(s)");
        }

        applicationService.downloadYTVideoFromIds(request);
        return new ResponseEntity<>(HttpStatus.ACCEPTED);
    }

    //endregion


    //region ########## Music Files ##########

    @RequestMapping(value = "/status/all", method = RequestMethod.GET)
    public ResponseEntity<Collection<FileStatus>> statusAll() {
        return new ResponseEntity<>(applicationService.getAllFilesStatus(), HttpStatus.OK);
    }


    @RequestMapping(value = "/status", method = RequestMethod.POST)
    public ResponseEntity<FileStatusResponse> status(@RequestBody FileStatusRequest request) {
        return new ResponseEntity<>(applicationService.getFilesStatus(request), HttpStatus.OK);
    }

    @RequestMapping(value = "/dl", method = RequestMethod.POST, produces = "audio/mpeg")
    public @ResponseBody
    void download(HttpServletResponse response, @RequestBody DLFileRequest request) throws IOException {
        applicationService.downloadFile(request.getId(), response);
    }

    @RequestMapping(value = "/dl-zip", method = RequestMethod.POST, produces = "application/zip")
    public void downloadAsZip(HttpServletResponse response, @RequestBody DLFileAsZipRequest request) {
        applicationService.downloadFiles(request, response);
    }

    @RequestMapping(value = "/delete", method = RequestMethod.POST)
    public ResponseEntity<Boolean> delete(@RequestBody List<String> ids) throws FileNotFoundException {
        return new ResponseEntity<>(applicationService.deleteFiles(ids), HttpStatus.OK);
    }

    @RequestMapping(value = "/play", method = RequestMethod.GET)
    public void play(@RequestParam String id, HttpServletResponse response) throws IOException {

        if (id == null) {
            throw new BadRequestException("Id not provided");
        }

        applicationService.playSong(id, response);
    }

    @RequestMapping(value = "/tags", method = RequestMethod.POST)
    public ResponseEntity<Mp3Metadata> setTags(@RequestBody TagRequest tags) throws IOException, NotSupportedException {
        return new ResponseEntity<>(applicationService.setTags(tags), HttpStatus.OK);
    }

    //endregion

    @RequestMapping(value = "/test")
    public ResponseEntity<Object> test() {
        return new ResponseEntity<>("Test page is working", HttpStatus.OK);
    }
}
