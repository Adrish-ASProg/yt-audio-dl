package com.asoft.ytdl.interfaces;

@FunctionalInterface
public interface ErrorEvent {
    void onError(String id, Exception exception);
}
