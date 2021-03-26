package com.asoft.ytdl.model.request;

import com.asoft.ytdl.model.FileStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.lang.NonNull;

import java.util.Comparator;
import java.util.Map;

import static com.asoft.ytdl.model.request.FileStatusRequest.SortingDirection.DESC;
import static com.asoft.ytdl.model.request.FileStatusRequest.SortingType.NAME;
import static com.asoft.ytdl.model.request.FileStatusRequest.SortingType.START_DATE;
import static com.asoft.ytdl.model.request.FileStatusRequest.SortingType.STATUS;

@Getter
@Setter
@AllArgsConstructor
public class FileStatusRequest {

    private final static Map<SortingType, Comparator<FileStatus>> COMPARATOR_MAP = Map.of(
            NAME, Comparator.comparing(FileStatus::getName),
            STATUS, Comparator.comparing(FileStatus::getStatus),
            START_DATE, Comparator.comparing(FileStatus::getStartDate)
    );
    @NonNull
    private String filter;
    @NonNull
    private int pageIndex;
    @NonNull
    private int pageSize;
    @NonNull
    private SortingMode sort;

    public Comparator<FileStatus> sortingModeComparator() {
        var comparator = COMPARATOR_MAP.get(sort.getType());

        if (DESC.equals(sort.getDirection())) {
            comparator = comparator.reversed();
        }

        return comparator;
    }

    enum SortingType {
        NAME, STATUS, START_DATE;
    }

    enum SortingDirection {
        ASC, DESC;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    static class SortingMode {
        private SortingType type;
        private SortingDirection direction;
    }
}