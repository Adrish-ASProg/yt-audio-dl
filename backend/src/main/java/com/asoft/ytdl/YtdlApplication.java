package com.asoft.ytdl;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@EnableWebSecurity
@SpringBootApplication
public class YtdlApplication {

    public static void main(String[] args) {
        new SpringApplicationBuilder(YtdlApplication.class)
                .headless(false)
                .run();
    }
}
