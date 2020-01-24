package com.asoft.ytdl.application;

import com.asoft.ytdl.model.Tag;
import com.mpatric.mp3agic.ID3v1;
import com.mpatric.mp3agic.ID3v2;
import com.mpatric.mp3agic.InvalidDataException;
import com.mpatric.mp3agic.Mp3File;
import com.mpatric.mp3agic.NotSupportedException;
import com.mpatric.mp3agic.UnsupportedTagException;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class Mp3Tagger {

    private static final String RETAG_EXTENSION = ".retag";
    private static final String BACKUP_EXTENSION = ".bak";

    public void setTag(String filePath, Tag tag) throws IOException, NoSuchMethodException, InvocationTargetException, IllegalAccessException, NotSupportedException {
        // UUID not found
        if (!new File(filePath).exists()) {
            throw new FileNotFoundException("Unable to find file " + filePath);
        }

        Mp3File mp3File = null;
        try {
            mp3File = new Mp3File(filePath);
        } catch (IOException | UnsupportedTagException | InvalidDataException e) {
            e.printStackTrace();
            System.err.println("Unable to get file " + filePath + " as Mp3File");
            return;
        }

        if (mp3File.hasId3v2Tag()) {
            ID3v2 mp3Tags = mp3File.getId3v2Tag();

            // FIXME property rather than method ?
            String methodName = "set" + tag.getName().substring(0, 1).toUpperCase() + tag.getName().substring(1);
            Method setMethod = ID3v1.class.getMethod(methodName, String.class);
            setMethod.invoke(mp3Tags, tag.getValue());

            mp3File.setId3v2Tag(mp3Tags);
            System.out.println("Title successfully set to « " + mp3Tags.getTitle() + " »");

            mp3File.save(mp3File.getFilename() + RETAG_EXTENSION);
            renameFiles(mp3File.getFilename());
        }
    }


    private void renameFiles(String filename) {
        File originalFile = new File(filename);
        File backupFile = new File(filename + BACKUP_EXTENSION);
        File retaggedFile = new File(filename + RETAG_EXTENSION);
        if (backupFile.exists()) backupFile.delete();
        originalFile.renameTo(backupFile);
        retaggedFile.renameTo(originalFile);
    }
}
