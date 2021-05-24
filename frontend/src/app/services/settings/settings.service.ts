import {Injectable} from '@angular/core';
import {SettingsServiceModule} from "./settings-service.module";


enum OptionsKey {
    API_ADDRESS = "API_ADDRESS",
    DISPLAYED_COLUMNS = "DISPLAYED_COLUMNS",
    PAGE_SIZE = "PAGE_SIZE",
    SONGS_DIRECTORY = "SONGS_DIRECTORY"
}

class Option {
    name: string;
    defaultValue: any;
    value: any;
}

@Injectable({providedIn: SettingsServiceModule})
export class SettingsService {

    options: Option[] = [
        {name: OptionsKey.API_ADDRESS, value: "http://192.168.0.1:8080", defaultValue: "http://192.168.0.1:8080"},
        {name: OptionsKey.DISPLAYED_COLUMNS, value: "select|name|status|startDate", defaultValue: "select|name|status|startDate"},
        {name: OptionsKey.PAGE_SIZE, value: "10", defaultValue: "10"},
        {name: OptionsKey.SONGS_DIRECTORY, value: "", defaultValue: ""}
    ];

    constructor() {
        this.options.forEach(opt => {
            let value: any = window.localStorage.getItem(opt.name);
            if (value == void 0) {
                window.localStorage.setItem(opt.name, opt.defaultValue.toString());
            } else opt.value = value;
        });
    }

    resetPreferences(): void {
        window.localStorage.clear();
    }

    getPageSize(): number {
        return this.getOption(OptionsKey.PAGE_SIZE);
    }

    setPageSize(value: number): boolean {
        this.setOption(OptionsKey.PAGE_SIZE, value);
        console.debug("Page size value set to " + value);
        return true;
    }

    getDisplayedColumns(): string {
        return this.getOption(OptionsKey.DISPLAYED_COLUMNS);
    }

    setDisplayedColumns(value: string): boolean {
        this.setOption(OptionsKey.DISPLAYED_COLUMNS, value);
        console.debug("Displayed columns value set to " + value);
        return true;
    }

    getServerAddress(): string {
        return this.getOption(OptionsKey.API_ADDRESS);
    }

    setServerAddress(value: string): boolean {
        // TODO Check
        this.setOption(OptionsKey.API_ADDRESS, value);
        console.debug("Api address set to " + value);
        return true;
    }

    getSongsDirectory(): string {
        return this.getOption(OptionsKey.SONGS_DIRECTORY);
    }

    setSongsDirectory(value: string): boolean {
        this.setOption(OptionsKey.SONGS_DIRECTORY, value);
        console.debug("Saved folders value set to " + value);
        return true;
    }


    private getOption(name: string) {
        const option = this.options.find(opt => name === opt.name);
        return option.value != void 0 && option.value !== ""
            ? option.value : option.defaultValue;
    }

    private setOption(name: string, value: any): void {
        window.localStorage.setItem(name, value.toString());
        this.options
            .find(opt => name === opt.name)
            .value = value;
    }
}
