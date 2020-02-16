import {Component} from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    // Toolbar
    projectTitle: string = 'yt-audio-dl';

    menuButtons: { label: string, action: () => void }[] = [];

    public onRouterOutletActivate(event: any) {
        this.menuButtons = event.getMenu ? event.getMenu() : [];
    }
}
