package com.asoft.ytdl.utils;

import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Paths;

public class FileUtils {

    public static String normalizePath(String path) {
        return Paths.get(path).toString();
    }

    public static String normalizePath(String path, boolean addSeparator) {
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
    public static String saveFile(MultipartFile file, String destDir, String fileName, Boolean overwrite) {
        File destDirFile = new File(destDir);

        try {
            // Création dossier(s) si n'existe pas
            if (!destDirFile.exists() && !destDirFile.mkdirs()) return "Impossible de créer le dossier de destination";


            File resultFile = new File(destDir + fileName);
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

    public static File getFile(String filePath) throws FileNotFoundException {
        File file = new File(filePath);
        if (!file.exists()) {
            throw new FileNotFoundException("file with path: " + file.getAbsolutePath() + " was not found.");
        }
        return file;
    }

    public static boolean renameFile(File oldFile, String newName) throws IOException {
        if (oldFile == null || !oldFile.exists()) return false;

        File newFile = new File(newName);

        if (newFile.exists()) throw new IOException("File exists");

        System.out.println("renaming file " + oldFile.getAbsolutePath() + " into " + newFile.getAbsolutePath());

        return oldFile.renameTo(newFile);
    }

    public static boolean deleteFile(File file) {
        if (file == null) return false;
        System.out.println("deleting file " + file.getAbsolutePath());

        // Récupération des fichiers dans le dossier
        File[] contents = file.listFiles();

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
}
