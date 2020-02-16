package com.asoft.ytdl.utils;

import com.asoft.ytdl.model.XmlConfiguration;

import java.io.File;
import java.io.IOException;

public class SettingsManager {

    public final static String DOWNLOAD_FOLDER = "downloaded";
    public final static String CONFIG_FILE = DOWNLOAD_FOLDER + File.separator + "metadata.xml";

    public static void initialize() {
        // Create download folder
        if (!new File(DOWNLOAD_FOLDER).exists()) {
            boolean result = new File(DOWNLOAD_FOLDER).mkdir();
            if (!result) {
                System.err.println("Unable to create download directory. Exiting..");
                System.exit(1);
            }
        }

        // Create config file metadata.xml
        if (!new File(CONFIG_FILE).exists()) {
            boolean result = false;

            try {
                result = new File(CONFIG_FILE).createNewFile();
                XMLManager.write(new XmlConfiguration());
            } catch (IOException e) {
                e.printStackTrace();
                result = false;
            }

            if (!result) {
                System.err.println("Unable to create configuration file. Exiting..");
                System.exit(1);
            }
        }
    }
}
