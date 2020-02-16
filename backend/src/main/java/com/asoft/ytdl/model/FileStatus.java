package com.asoft.ytdl.model;

import com.asoft.ytdl.enums.ProgressStatus;
import lombok.Getter;
import lombok.Setter;

import javax.xml.bind.annotation.XmlRootElement;

@Getter
@Setter
@XmlRootElement
public class FileStatus {
    private String id;
    private String name;
    private ProgressStatus status;
    private Long startDate;
    private Mp3Metadata metadata;

    @Override
    public String toString() {
        return "FileStatus{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", status=" + status +
                ", startDate=" + startDate +
                ", metadata=" + metadata +
                '}';
    }
}
