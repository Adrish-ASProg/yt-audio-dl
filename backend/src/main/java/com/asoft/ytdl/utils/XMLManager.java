package com.asoft.ytdl.utils;

import com.asoft.ytdl.model.XmlConfiguration;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;
import java.io.File;
import java.io.IOException;

public class XMLManager {

    public final static String CONFIG_FILE = "settings.xml";

    public static void initialize() {
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

    public static XmlConfiguration read() {
        var configuration = new XmlConfiguration();

        if (!new File(CONFIG_FILE).exists()) return configuration;

        try {
            JAXBContext jaxbContext = JAXBContext.newInstance(XmlConfiguration.class);
            Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
            configuration = (XmlConfiguration) jaxbUnmarshaller.unmarshal(new File(CONFIG_FILE));
        } catch (Exception e) { e.printStackTrace(); }

        return configuration;
    }

    public static void write(XmlConfiguration config) {
        try {
            JAXBContext jaxbContext = JAXBContext.newInstance(XmlConfiguration.class);
            Marshaller jaxbMarshaller = jaxbContext.createMarshaller();
            jaxbMarshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
            jaxbMarshaller.marshal(config, new File(CONFIG_FILE));
        } catch (JAXBException e) {
            e.printStackTrace();
            System.err.println("Unable to save configuration file");
        }
    }
}
