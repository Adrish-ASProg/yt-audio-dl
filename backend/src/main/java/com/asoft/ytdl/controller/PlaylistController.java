package com.asoft.ytdl.controller;

import com.asoft.ytdl.model.Playlist;
import com.asoft.ytdl.service.ApplicationService;
import com.asoft.ytdl.service.PlaylistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collection;
import java.util.List;

@CrossOrigin
@ControllerAdvice
@RestController
@RequiredArgsConstructor
public class PlaylistController {

    private final ApplicationService applicationService;
    private final PlaylistService playlistService;


    @RequestMapping(value = "/playlists", method = RequestMethod.GET)
    public ResponseEntity<Collection<Playlist>> getPlaylists() {
        return new ResponseEntity<>(playlistService.getPlaylists(), HttpStatus.OK);
    }

    @RequestMapping(value = "/playlists", method = RequestMethod.POST)
    public ResponseEntity<Playlist> updatePlaylist(@RequestBody Playlist playlist) {
        return new ResponseEntity<>(playlistService.updatePlaylist(playlist), HttpStatus.OK);
    }

    @RequestMapping(value = "/playlists/{name}/add", method = RequestMethod.POST)
    public ResponseEntity<Playlist> addFilesToPlaylist(@PathVariable(value = "name") String playlistName,
                                                       @RequestBody List<String> fileStatusIds) {

        return new ResponseEntity<>(
                playlistService.addFilesToPlaylist(playlistName, fileStatusIds, applicationService.getFilesStatus()),
                HttpStatus.OK);
    }

    @RequestMapping(value = "/playlists/{name}/download", method = RequestMethod.POST, produces = "application/x-mpegURL")
    public void downloadPlaylist(HttpServletResponse response,
                                 @PathVariable(value = "name") String playlistName,
                                 @RequestBody String songsDirectory) throws IOException {

        playlistService.downloadPlaylist(playlistName, songsDirectory, response);
    }

    @RequestMapping(value = "/playlists/{name}", method = RequestMethod.DELETE)
    public ResponseEntity<Void> deletePlaylist(@PathVariable(value = "name") String playlistName) {

        playlistService.deletePlaylist(playlistName);
        return new ResponseEntity<>(HttpStatus.ACCEPTED);
    }
}
