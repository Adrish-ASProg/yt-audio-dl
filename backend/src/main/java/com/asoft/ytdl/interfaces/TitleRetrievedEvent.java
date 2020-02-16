package com.asoft.ytdl.interfaces;

@FunctionalInterface
public interface TitleRetrievedEvent {
    void onTitleRetrievedEvent(String id, String title);
}
