import {Injectable} from '@angular/core';
import {SettingsServiceModule} from "./settings-service.module";


enum OptionsKeys {
    REFRESH_RATE = "REFRESH_RATE"
}

class Option {
    name: string;
    defaultValue: any;
    value: any;
}

@Injectable({providedIn: SettingsServiceModule})
export class SettingsService {

    options: Option[] = [
        {name: OptionsKeys.REFRESH_RATE, value: 1500, defaultValue: 1500}
    ];

    constructor() {
        this.options.forEach(opt => {
            let value: any = window.localStorage.getItem(opt.name);
            if (value == void 0) {
                window.localStorage.setItem(opt.name, opt.defaultValue.toString());
            }
            else opt.value = value;
        });
    }

    getRefreshRate() {
        return this.getOption(OptionsKeys.REFRESH_RATE).value;
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

    private getOption(name: string): Option {
        return this.options.find(opt => name === opt.name)
    }

    private setOption(name: string, value: any): void {
        window.localStorage.setItem(name, value.toString());
        this.options
            .find(opt => name === opt.name)
            .value = value;
    }
}
