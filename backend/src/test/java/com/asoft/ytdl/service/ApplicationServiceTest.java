package com.asoft.ytdl.service;

import com.asoft.ytdl.model.request.TagRequest;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ContextConfiguration;

import java.io.FileNotFoundException;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;

@ContextConfiguration(classes = {ApplicationService.class})
@WebMvcTest
class ApplicationServiceTest {

    @InjectMocks
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
