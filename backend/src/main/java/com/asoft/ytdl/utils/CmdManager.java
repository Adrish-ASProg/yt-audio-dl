package com.asoft.ytdl.utils;

import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

interface CmdOutputEvent {
    void onOutput(String text);
}

interface CmdErrorEvent {
    void onError(String text);
}

@Setter
@NoArgsConstructor
public class CmdManager {

    private CmdOutputEvent outputEvent = (text) -> {};
    private CmdErrorEvent errorEvent = (text) -> {};
    private boolean verboseMode = false;

    public CmdManager(boolean verboseMode) { this.verboseMode = verboseMode; }


    public void executeCommand(String command) {
        if (verboseMode) System.out.println(command);

        long startTime = System.currentTimeMillis();

        try {
            Process process = Runtime.getRuntime().exec(command);

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            BufferedReader errReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));

            String line, errLine;
            while ((line = reader.readLine()) != null) { outputEvent.onOutput(line); }
            while ((errLine = errReader.readLine()) != null) { errorEvent.onError(errLine); }
            reader.close();

        } catch (IOException e) {
            e.printStackTrace();
            errorEvent.onError("Cannot execute command, file not found.");
        } catch (Exception err) {
            err.printStackTrace();
        }
        outputEvent.onOutput("Process terminated in " + (System.currentTimeMillis() - startTime) + "ms");
    }
}
