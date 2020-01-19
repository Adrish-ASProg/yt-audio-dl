package com.asoft.ytdl.utils;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.FileTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class FileUtils {
    public static File getFile(String filePath) throws FileNotFoundException {
        File file = new File(filePath);
        if (!file.exists()) {
            throw new FileNotFoundException("file with path: " + file.getAbsolutePath() + " was not found.");
        }
        return file;
    }

    public static Long getCreationDate(File file) {
        try {
            FileTime creationTime = (FileTime) Files.getAttribute(file.toPath(), "creationTime");
            return creationTime.to(TimeUnit.MILLISECONDS);
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static List<File> getAllFilesInDirectory(File file) {
        try (Stream<Path> walk = Files.walk(file.toPath())) {

            List<File> result = walk.filter(Files::isRegularFile)
                    .map(Path::toString)
                    .map(File::new)
                    .collect(Collectors.toList());

            result.forEach(f -> System.out.println(f.getName()));
            return result;
        } catch (IOException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
}
