package com.asoft.ytdl.utils;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.FileTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class FileUtils {

    public static String normalizePath(final String path) {
        return Paths.get(path).toString();
    }

    public static String normalizePath(final String path,
                                       final boolean addSeparator) {
        return addSeparator
                ? normalizePath(path) + File.separator
                : normalizePath(path);
    }

    public static File buildFile(final String directory, final String fileName) {
        return new File(normalizePath(directory, true) + fileName);
    }

    public static File getFile(final String filePath) throws FileNotFoundException {
        var file = new File(filePath);
        if (!file.exists()) {
            throw new FileNotFoundException("file with path: " + file.getAbsolutePath() + " was not found.");
        }
        return file;
    }

    public static void writeToFile(final String fileName, final String destination, final String content) {
        var filePath = normalizePath(destination, true) + fileName;

        try (var fileWriter = new FileWriter(filePath)) {
            fileWriter.write(content);
            System.out.println("Successfully write to file " + filePath);
        } catch (IOException e) {
            System.out.println("An error occurred trying to write to file " + filePath);
            e.printStackTrace();
        }
    }

    public static List<String> readFileContentAsLines(final File file) {
        var fileContent = new ArrayList<String>();

        try (var sc = new Scanner(file)) {
            while (sc.hasNextLine())
                fileContent.add(sc.nextLine());

            return fileContent;
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static boolean renameFile(final File oldFile,
                                     final String newName) throws IOException {
        if (oldFile == null || !oldFile.exists()) return false;

        var newFile = new File(newName);

        if (newFile.exists()) throw new IOException("File exists");

        System.out.println("renaming file " + oldFile.getAbsolutePath() + " into " + newFile.getAbsolutePath());

        return oldFile.renameTo(newFile);
    }

    public static boolean deleteFile(final File file) {
        if (file == null) return false;

        // Récupération des fichiers dans le dossier
        var contents = file.listFiles();

        // Si au moins un fichier est présent
        if (contents != null) {
            // Supprime chaque fichiers
            for (File f : contents) {
                if (!deleteFile(f)) {
                    return false;
                }
            }
        }
        return file.delete();
    }

    public static Long getCreationDate(final File file) {
        try {
            var creationTime = (FileTime) Files.getAttribute(file.toPath(), "creationTime");
            return creationTime.to(TimeUnit.MILLISECONDS);
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static List<File> getAllFilesInDirectory(final File directory) {
        try (Stream<Path> walk = Files.walk(directory.toPath())) {
            return walk.filter(Files::isRegularFile)
                    .map(Path::toString)
                    .map(File::new)
                    .collect(Collectors.toList());
        } catch (IOException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
}
