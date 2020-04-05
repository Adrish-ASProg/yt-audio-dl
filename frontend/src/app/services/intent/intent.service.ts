import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class IntentService {

    public onIntentReceived: (url) => void = url => {};

    init() {
        if (!window['plugins'] || !window['plugins'].intentShim) {
            console.debug('No intentShim');
            return;
        }

        // Intent received when application is already running
        window['plugins'].intentShim.onIntent(intent => this.processIntent(intent));

        // Intent which launched application
        window['plugins'].intentShim.getIntent(intent => this.processIntent(intent), () => {});
    }

    processIntent(intent) {
        console.log(intent);

        if (intent.action !== 'android.intent.action.SEND' || intent.extras == void 0) {
            console.debug('Invalid intent, skipping');
            return;
        }

        const textIntent = intent.extras['android.intent.extra.TEXT'];
        if (!textIntent) {
            console.debug('No text in extras');
            return;
        }

        if (this.isTextIntentValid(textIntent)) this.onIntentReceived(textIntent);
    }

    /** Indicate if text in intent is a valid youtube url
     * Basic check for now
     **/
    isTextIntentValid(text: string): boolean {
        return text.includes("youtube.com") || text.includes("youtu.be");
    }
}
