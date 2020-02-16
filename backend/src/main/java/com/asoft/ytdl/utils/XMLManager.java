package com.asoft.ytdl.utils;

import com.asoft.ytdl.model.XmlConfiguration;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;
import java.io.File;

import static com.asoft.ytdl.utils.SettingsManager.DOWNLOAD_FOLDER;

public class XMLManager {

    private static String directory = DOWNLOAD_FOLDER + File.separator;
    private static String configFilePath = directory + "metadata.xml";

    public static XmlConfiguration read() {
        try {
            JAXBContext jaxbContext = JAXBContext.newInstance(XmlConfiguration.class);
            Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
            return (XmlConfiguration) jaxbUnmarshaller.unmarshal(new File(configFilePath));
        } catch (JAXBException e) {
            e.printStackTrace();
        }

        return null;
    }

    public static void write(XmlConfiguration config) {
        try {
            JAXBContext jaxbContext = JAXBContext.newInstance(XmlConfiguration.class);
            Marshaller jaxbMarshaller = jaxbContext.createMarshaller();
            jaxbMarshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
            jaxbMarshaller.marshal(config, new File(configFilePath));
        } catch (JAXBException e) {
            e.printStackTrace();
        }
    }
}
