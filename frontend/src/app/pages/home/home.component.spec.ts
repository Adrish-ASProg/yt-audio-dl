import {ActivatedRoute} from "@angular/router";
import {MatMenuModule} from "@angular/material/menu";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {BrowserModule} from "@angular/platform-browser";
import {MatButtonModule} from "@angular/material/button";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

import {IonicModule} from "@ionic/angular";
import {File} from "@ionic-native/file/ngx";

import {HomeComponent} from './home.component';
import {APIModule} from "../../services/api/api.module";
import {AppManagerModule} from "../../services/request-handler/app-manager.module";
import {ToolsDialogModule} from "../../components/tools-dialog/tools-dialog.module";
import {SettingsServiceModule} from "../../services/settings/settings-service.module";
import {SettingsDialogModule} from "../../components/settings-dialog/settings-dialog.module";
import {FileStatusTableModule} from "../../components/file-status-table/file-status-table.module";
import {TagEditorDialogModule} from "../../components/tag-editor-dialog/tag-editor-dialog.module";

describe('HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    beforeEach(waitForAsync(() => {
        const fakeActivatedRoute = {
            snapshot: {data: {}, fragment: "/home"}
        } as ActivatedRoute;

        TestBed.configureTestingModule({
            declarations: [HomeComponent],
            imports: [
                BrowserModule,
                BrowserAnimationsModule,
                IonicModule,

                APIModule,
                AppManagerModule,
                SettingsServiceModule,
                FileStatusTableModule,
                TagEditorDialogModule,
                ToolsDialogModule,
                SettingsDialogModule,

                FormsModule,
                ReactiveFormsModule,

                MatFormFieldModule,
                MatInputModule,
                MatButtonModule,
                MatMenuModule,
                MatButtonToggleModule,
                MatProgressBarModule,
                MatIconModule,
                MatCheckboxModule
            ],
            providers: [
                File,
                {provide: ActivatedRoute, useValue: fakeActivatedRoute},
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
