package com.asoft.ytdl.service;

import com.asoft.ytdl.constants.Constants;
import com.asoft.ytdl.exception.BadRequestException;
import com.asoft.ytdl.exception.InternalServerException;
import com.asoft.ytdl.exception.NotFoundException;
import com.asoft.ytdl.model.FileStatus;
import com.asoft.ytdl.model.Playlist;
import com.asoft.ytdl.properties.DirectoryProperties;
import com.asoft.ytdl.utils.FileUtils;
import org.apache.commons.io.IOUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

import static com.asoft.ytdl.utils.FileUtils.buildFile;
import static com.asoft.ytdl.utils.FileUtils.deleteFile;
import static com.asoft.ytdl.utils.FileUtils.normalizePath;
import static java.lang.String.format;
import static org.apache.commons.collections.CollectionUtils.isEmpty;
import static org.apache.commons.io.IOUtils.toInputStream;
import static org.apache.commons.lang3.StringUtils.isBlank;

@Service
public class PlaylistService {

    private final List<Playlist> playlists;
    private final DirectoryProperties directoryProperties;

    PlaylistService(final DirectoryProperties directoryProperties) {
        this.directoryProperties = directoryProperties;

        playlists = getPlaylistFiles();

        System.out.println(playlists.size() + " playlists retrieved");
    }


    //region ########## Request handlers ##########

    /**
     * GET /playlists
     **/
    public Collection<Playlist> getPlaylists() {
        return this.playlists;
    }

    /**
     * POST /playlists
     **/
    public Playlist updatePlaylist(final Playlist newPlaylist) {
        newPlaylist.sanitizeFileNames();

        if (isBlank(newPlaylist.getName()) || isEmpty(newPlaylist.getFiles())) {
            throw new BadRequestException("Missing playlist name or file list");
        }

        this.playlists.stream()
                .filter(p -> p.getName().equalsIgnoreCase(newPlaylist.getName()))
                .findFirst()
                .ifPresentOrElse(
                        playlistToUpdate -> playlistToUpdate.setFiles(newPlaylist.getFiles()),
                        () -> this.playlists.add(newPlaylist));

        savePlaylist(newPlaylist);

        return newPlaylist;
    }

    /**
     * POST /playlists/{id}/add
     **/
    public Playlist addFilesToPlaylist(final String playlistName,
                                       final List<String> fileStatusIds,
                                       final List<FileStatus> filesStatus) {

        if (isBlank(playlistName) || isEmpty(fileStatusIds)) {
            throw new BadRequestException("Missing playlist name or file list");
        }

        var filesToAdd = filesStatus.stream()
                .filter(fs -> fileStatusIds.contains(fs.getId()))
                .map(fileStatus -> fileStatus.getName() + ".mp3") // FIXME
                .collect(Collectors.toList());

        if (isEmpty(filesToAdd)) {
            throw new BadRequestException("No files found to add. You may want to refresh your data");
        }

        var playlistToUpdate = this.playlists.stream()
                .filter(p -> p.getName().equalsIgnoreCase(playlistName))
                .findFirst()
                .orElseGet(() -> {
                    var playlist = Playlist.builder().name(playlistName).build();
                    playlists.add(playlist);
                    return playlist;
                });

        filesToAdd.addAll(0, playlistToUpdate.getFiles());
        playlistToUpdate.setFiles(filesToAdd);

        savePlaylist(playlistToUpdate);

        return playlistToUpdate;
    }

    /**
     * GET /playlists/{name}/download
     **/
    public void downloadPlaylist(final String playlistName,
                                 final String prefixedDirectory,
                                 final HttpServletResponse response) throws IOException {

        var playlist = findPlaylistOrThrow(playlistName);

        var filename = playlistName + ".m3u8";
        var content = playlist.getFiles()
                .stream()
                .map(fileName -> normalizePath(prefixedDirectory, true) + fileName)
                .collect(Collectors.joining("\n"));

        IOUtils.copy(toInputStream(content, StandardCharsets.UTF_8), response.getOutputStream());

        response.addHeader(HttpHeaders.CONTENT_DISPOSITION, format("attachment; filename=\"%s\"", filename));
        response.setHeader(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "X-File-Name");
        response.setHeader(Constants.HttpHeader.FILE_NAME, filename);
        response.setStatus(HttpServletResponse.SC_OK);
        response.flushBuffer();

        System.out.printf("Playlist %s sent to download%n", playlistName);
    }

    /**
     * DELETE /playlists/{name}
     **/
    public void deletePlaylist(final String playlistName) {

        var playlist = findPlaylistOrThrow(playlistName);
        if (!deleteFile(buildFile(directoryProperties.getPlaylistDirectory(), playlist.getFilename()))) {
            throw new InternalServerException("Unable to delete playlist " + playlistName);
        }

        playlists.remove(playlist);
        System.out.printf("Playlist %s successfully deleted%n", playlistName);
    }

    //endregion


    //region ########## Private methods ##########

    private void savePlaylist(final Playlist playlist) {
        FileUtils.writeToFile(playlist.getFilename(),
                directoryProperties.getPlaylistDirectory(),
                String.join("\n", playlist.getFiles()));
    }

    private Playlist findPlaylistOrThrow(final String playlistName) {

        return playlists.stream()
                .filter(p -> playlistName.equals(p.getName()))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("No playlist with name « " + playlistName + " » found"));
    }

    private List<Playlist> getPlaylistFiles() {

        System.out.println("Retrieving playlists..");

        return FileUtils.getAllFilesInDirectory(new File(directoryProperties.getPlaylistDirectory()))
                .stream()
                .filter(f -> f.getName().endsWith(Playlist.EXTENSION))
                .map(Playlist::fromFile)
                .filter(p -> !isEmpty(p.getFiles()))
                .collect(Collectors.toList());
    }

    //endregion
}
