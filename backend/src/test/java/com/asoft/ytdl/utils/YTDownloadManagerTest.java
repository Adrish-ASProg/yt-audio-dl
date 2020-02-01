package com.asoft.ytdl.utils;

import org.apache.commons.validator.routines.UrlValidator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class YTDownloadManagerTest {

    final UrlValidator urlValidator = new UrlValidator(new String[]{"http", "https"});

    private static List<String> getValidUrls() {
        return Arrays.asList("https://www.example.com", "http://www.example.com", "http://blog.example.com",
                "http://www.example.com/product", "http://www.example.com/products?id=1&page=2", "http://www.site.com:8008",
                "https://www.google.com", "http://www.google.com", "http://www.example.com#up", "http://255.255.255.255");
    }

    private static List<String> getInvalidUrls() {
        return Arrays.asList("htt://www.google.com", "://www.google.com", "www.example.com", "example.com", "www.google.com",
                "255.255.255.255", "http://invalid.com/perl.cgi?key= | http://web-site.com/cgi-bin/perl.cgi?key1=value1&key2");
    }

    @ParameterizedTest()
    @MethodSource("getValidUrls")
    @DisplayName("All urls should match")
    void allUrlShouldMatch(String url) { assertTrue(urlValidator.isValid(url)); }

    @ParameterizedTest()
    @MethodSource("getInvalidUrls")
    @DisplayName("No urls should match")
    void noUrlShouldMatch(String url) { assertFalse(urlValidator.isValid(url)); }
}