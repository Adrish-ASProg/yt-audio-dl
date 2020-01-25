package com.asoft.ytdl.interfaces;

@FunctionalInterface
public interface TitleRetrievedEvent {
    void onTitleRetrievedEvent(String uuid, String title);
}
