package com.asoft.ytdl.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.xml.bind.annotation.XmlRootElement;
import java.util.List;

@Getter
@Setter
@XmlRootElement
@NoArgsConstructor
public class XmlConfiguration {
    String audioFolder = "E:\\Adri\\Downloads";
    String playlistFolder = "E:\\Adri\\Downloads";
    String outputFolder = "E:\\Adri\\Downloads";
    List<FileStatus> filesData;
}