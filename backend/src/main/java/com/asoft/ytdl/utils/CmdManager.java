package com.asoft.ytdl.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

abstract class CmdManager {

    abstract void handleOutput(String text);

    abstract void handleError(String text);

    void executeCommand(String command) {
        long startTime = System.currentTimeMillis();

        try {
            Process process = Runtime.getRuntime().exec(command);

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            BufferedReader errReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));

            String line, errLine;
            while ((line = reader.readLine()) != null) { handleOutput(line); }
            while ((errLine = errReader.readLine()) != null) { handleError(errLine); }
            reader.close();

        } catch (IOException e) {
            e.printStackTrace();
            handleError("Cannot execute command, file not found.");
        } catch (Exception err) {
            err.printStackTrace();
        }
        handleOutput("Process terminated in " + (System.currentTimeMillis() - startTime) + "ms");
    }
}
