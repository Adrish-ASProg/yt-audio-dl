package com.asoft.ytdl;

import com.asoft.ytdl.ui.MainFrame;
import com.asoft.ytdl.utils.XMLManager;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@EnableWebSecurity
@SpringBootApplication
public class YtdlApplication {

    private static MainFrame mainFrame;
    private static SpringApplicationBuilder apiBuilder;

    public static void main(String[] args) {
        XMLManager.initialize();
        mainFrame = new MainFrame();

        if (args != null && args.length > 0 && "useGUI".equals(args[0])) {
            mainFrame.setVisible(true);
        } else startAPI();
    }

    public static void startAPI() {
        //	Swing config
        apiBuilder = new SpringApplicationBuilder(YtdlApplication.class);
        apiBuilder.headless(false);
        apiBuilder.run();
    }

    public static void stopAPI() { apiBuilder.context().close(); }

    public static boolean isStarted() {
        if (apiBuilder == null || apiBuilder.context() == null) return false;
        return apiBuilder.context().isActive();
    }

    @Bean
    public MainFrame mainFrame() {
        return mainFrame;
    }

}
