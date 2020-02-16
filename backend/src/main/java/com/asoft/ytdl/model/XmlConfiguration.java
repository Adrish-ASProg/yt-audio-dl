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
    List<FileStatus> filesData;
}