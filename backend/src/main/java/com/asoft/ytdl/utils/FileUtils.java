package com.asoft.ytdl.utils;

import java.io.File;
import java.io.FileNotFoundException;

public class FileUtils {
    public static File getFile(String filePath) throws FileNotFoundException {
        File file = new File(filePath);
        if (!file.exists()) {
            throw new FileNotFoundException("file with path: " + file.getAbsolutePath() + " was not found.");
        }
        return file;
    }
}
