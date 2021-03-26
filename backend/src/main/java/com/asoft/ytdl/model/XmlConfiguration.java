package com.asoft.ytdl.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.xml.bind.annotation.XmlRootElement;

@Getter
@Setter
@XmlRootElement
@NoArgsConstructor
public class XmlConfiguration {
    String audioFolder = "E:\\Adri\\Music";
    String playlistFolder = "E:\\Adri\\Music";
    String outputFolder = "E:\\Adri\\Downloads";
}