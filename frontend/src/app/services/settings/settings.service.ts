import {Injectable} from '@angular/core';
import {SettingsServiceModule} from "./settings-service.module";


enum OptionsKeys {
    API_ADDRESS = "API_ADDRESS",
    DISPLAYED_COLUMNS = "DISPLAYED_COLUMNS",
    PAGE_SIZE = "PAGE_SIZE",
    REFRESH_RATE = "REFRESH_RATE",
    SAVED_FOLDERS = "SAVED_FOLDERS"
}

class Option {
    name: string;
    defaultValue: any;
    value: any;
}

@Injectable({providedIn: SettingsServiceModule})
export class SettingsService {

    options: Option[] = [
        {name: OptionsKeys.API_ADDRESS, value: "http://192.168.1.1:8080", defaultValue: "http://192.168.1.1:8080"},
        {name: OptionsKeys.DISPLAYED_COLUMNS, value: "select|name|status|startDate", defaultValue: "select|name|status|startDate"},
        {name: OptionsKeys.PAGE_SIZE, value: "10", defaultValue: "10"},
        {name: OptionsKeys.REFRESH_RATE, value: 1500, defaultValue: 1500},
        {name: OptionsKeys.SAVED_FOLDERS, value: "", defaultValue: ""}
    ];

    constructor() {
        this.options.forEach(opt => {
            let value: any = window.localStorage.getItem(opt.name);
            if (value == void 0) {
                window.localStorage.setItem(opt.name, opt.defaultValue.toString());
            } else opt.value = value;
        });
    }

    getPageSize(): number {
        return this.getOption(OptionsKeys.PAGE_SIZE);
    }

    setPageSize(value: number): boolean {
        this.setOption(OptionsKeys.PAGE_SIZE, value);
        console.debug("Page size value set to " + value);
        return true;
    }

    getDisplayedColumns(): string {
        return this.getOption(OptionsKeys.DISPLAYED_COLUMNS);
    }

    setDisplayedColumns(value: string): boolean {
        this.setOption(OptionsKeys.DISPLAYED_COLUMNS, value);
        console.debug("Displayed columns value set to " + value);
        return true;
    }

    getServerAddress(): string {
        return this.getOption(OptionsKeys.API_ADDRESS);
    }

    setServerAddress(value: string): boolean {
        // TODO Check
        this.setOption(OptionsKeys.API_ADDRESS, value);
        console.debug("Api address set to " + value);
        return true;
    }

    getRefreshRate(): number {
        return this.getOption(OptionsKeys.REFRESH_RATE);
    }

    setRefreshRate(value: number): boolean {
        if (isNaN(value)) {
            console.error("Unable to set refresh rate: Not a Number. Provided value: ", value);
            return false;
        }

        if (value < 500 || value > 300000) {
            console.error("Unable to set refresh rate: Value should be between 500ms and 5mn. Provided value: ", value);
            return false;
        }

        this.setOption(OptionsKeys.REFRESH_RATE, value);
        console.debug("Refresh rate value set to " + value);
        return true;
    }

    getSavedFolders(): string {
        return this.getOption(OptionsKeys.SAVED_FOLDERS);
    }

    setSavedFolders(value: string): boolean {
        this.setOption(OptionsKeys.SAVED_FOLDERS, value);
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
