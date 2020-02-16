package com.asoft.ytdl.application;

import com.asoft.ytdl.model.Mp3Metadata;
import com.mpatric.mp3agic.ID3v1;
import com.mpatric.mp3agic.ID3v1Genres;
import com.mpatric.mp3agic.ID3v2;
import com.mpatric.mp3agic.InvalidDataException;
import com.mpatric.mp3agic.Mp3File;
import com.mpatric.mp3agic.NotSupportedException;
import com.mpatric.mp3agic.UnsupportedTagException;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;

public class Mp3Tagger {

    private static final String RETAG_EXTENSION = ".retag";
    private static final String BACKUP_EXTENSION = ".bak";

    public static void setTags(String filePath, Mp3Metadata tags) throws IOException, NotSupportedException {
        // File not found
        if (!new File(filePath).exists()) {
            throw new FileNotFoundException("[Mp3Tagger.setTags] Unable to find file " + filePath);
        }

        Mp3File mp3File = getMp3File(filePath);
        if (mp3File == null) return;

        if (!mp3File.hasId3v1Tag() && !mp3File.hasId3v2Tag()) {
            System.err.println("Unable to set tags: No Id3v1/Id3v2 tags found in file " + filePath);
            return;
        }

        if (mp3File.hasId3v1Tag()) {
            ID3v1 mp3Tags = mp3File.getId3v1Tag();
            mp3Tags.setAlbum(tags.getAlbum());
            mp3Tags.setArtist(tags.getArtist());
            mp3Tags.setGenre(ID3v1Genres.matchGenreDescription(tags.getGenre()));
            mp3Tags.setTitle(tags.getTitle());

            mp3File.setId3v1Tag(mp3Tags);
        }

        if (mp3File.hasId3v2Tag()) {
            ID3v2 mp3Tags = mp3File.getId3v2Tag();
            mp3Tags.setAlbum(tags.getAlbum());
            mp3Tags.setArtist(tags.getArtist());
            mp3Tags.setGenre(ID3v1Genres.matchGenreDescription(tags.getGenre()));
            mp3Tags.setTitle(tags.getTitle());

            mp3File.setId3v2Tag(mp3Tags);
        }

        mp3File.save(mp3File.getFilename() + RETAG_EXTENSION);
        renameFiles(mp3File.getFilename());
        System.out.println("Successfully set tags: " + tags + " in file " + filePath);
    }

    public static Mp3Metadata getTags(String filePath) {
        Mp3Metadata metadata = new Mp3Metadata();

        // File not found
        if (!new File(filePath).exists()) {
            // throw new FileNotFoundException("Unable to find file " + filePath);
            System.err.println("[Mp3Tagger.getTags] Unable to find file " + filePath);
        }

        Mp3File mp3File = getMp3File(filePath);
        if (mp3File == null) return metadata;

        if (mp3File.hasId3v2Tag()) {
            ID3v2 tags = mp3File.getId3v2Tag();
            metadata.setAlbum(tags.getAlbum());
            metadata.setArtist(tags.getArtist());
            metadata.setTitle(tags.getTitle());

            int genreIdx = tags.getGenre();
            if (genreIdx != -1 && genreIdx < ID3v1Genres.GENRES.length)
                metadata.setGenre(ID3v1Genres.GENRES[genreIdx]);
        }

        return metadata;
    }

    private static Mp3File getMp3File(String filePath) {
        Mp3File mp3File = null;
        try {
            mp3File = new Mp3File(filePath);
        } catch (IOException | UnsupportedTagException | InvalidDataException e) {
            e.printStackTrace();
            System.err.println("[Mp3Tagger.getMp3File] Unable to get file " + filePath + " as Mp3File");
        }

        return mp3File;
    }

    @SuppressWarnings("ResultOfMethodCallIgnored")
    private static void renameFiles(String filename) {
        File originalFile = new File(filename);
        File backupFile = new File(filename + BACKUP_EXTENSION);
        File retaggedFile = new File(filename + RETAG_EXTENSION);
        if (backupFile.exists()) backupFile.delete();
        originalFile.renameTo(backupFile);
        retaggedFile.renameTo(originalFile);
    }
}