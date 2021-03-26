package com.asoft.ytdl.utils;

import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.FileTime;
import java.util.ArrayList;
import java.util.List;
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

    /**
     * Enregistre un fichier à l'emplacement et sous le nom indiqué
     *
     * @param file      Le fichier à enregistrer
     * @param destDir   Le dossier de destination
     * @param fileName  Le nom sous lequel enregistrer le fichier
     * @param overwrite Écrase le fichier existant
     * @return Une chaine vide si aucune erreur,
     * le message de l'erreur sinon
     */
    public static String saveFile(final MultipartFile file,
                                  final String destDir,
                                  final String fileName,
                                  final Boolean overwrite) {

        var destDirFile = new File(destDir);

        try {
            // Création dossier(s) si n'existe pas
            if (!destDirFile.exists() && !destDirFile.mkdirs()) return "Impossible de créer le dossier de destination";


            var resultFile = new File(destDir + fileName);
            // Le fichier existe déjà
            if (resultFile.exists()) {
                // Pas d'écrasement du fichier
                if (!overwrite) return "Le fichier existe déjà";

                // Écrasement du fichier
                if (!deleteFile(resultFile)) return "Le fichier existe déjà et la suppression a échouée";
            }

            // Sauvegarde du fichier
            file.transferTo(resultFile);

        } catch (IOException e) {
            e.printStackTrace();
            return e.getMessage();
        }

        return "";
    }

    public static File getFile(final String filePath) throws FileNotFoundException {
        var file = new File(filePath);
        if (!file.exists()) {
            throw new FileNotFoundException("file with path: " + file.getAbsolutePath() + " was not found.");
        }
        return file;
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
        System.out.println("deleting file " + file.getAbsolutePath());

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
