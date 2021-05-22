package com.asoft.ytdl.service;

import com.asoft.ytdl.model.request.TagRequest;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.FileNotFoundException;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;

@SpringBootTest
class ApplicationServiceTest {

    @Autowired
    ApplicationService appService;

    @Nested
    class downloadFileTests {
        @Test
        void downloadUnexistingFile() {
            assertThrows(FileNotFoundException.class, () -> appService.downloadFile(null, any()));
        }
    }

    @Nested
    class setTagsTests {
        @Test
        void setTagsUnexistingFile() {
            var request = new TagRequest() {{setId(anyString());}};
            assertThrows(FileNotFoundException.class, () -> appService.setTags(request));
        }
    }
}
