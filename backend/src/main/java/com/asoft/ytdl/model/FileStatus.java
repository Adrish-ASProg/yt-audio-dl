package com.asoft.ytdl.model;

import com.asoft.ytdl.enums.ProgressStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FileStatus {
    private String uuid;
    private String name;
    private ProgressStatus status;
    private Long startDate;
    private Mp3Metadata metadata;

    @Override
    public String toString() {
        return "FileStatus{" +
                "uuid='" + uuid + '\'' +
                ", name='" + name + '\'' +
                ", status=" + status +
                ", startDate=" + startDate +
                ", metadata=" + metadata +
                '}';
    }
}
