package com.asoft.ytdl.model;

import com.asoft.ytdl.constants.enums.ProgressStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@JsonIgnoreProperties("absolutePath")
public class FileStatus {
    private String id;
    private String name;
    private ProgressStatus status;
    private Long startDate;
    private Mp3Metadata metadata;
    private String absolutePath;

    @Override
    public String toString() {
        return "FileStatus{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", status=" + status +
                ", startDate=" + startDate +
                ", metadata=" + metadata +
                ", absolutePath=" + absolutePath +
                '}';
    }
}
