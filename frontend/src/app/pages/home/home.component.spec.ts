import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {HomeComponent} from './home.component';
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {APIModule} from "../../services/api/api.module";
import {FileStatusTableModule} from "../../components/file-status-table/file-status-table.module";
import {TagEditorDialogModule} from "../../components/tag-editor-dialog/tag-editor-dialog.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatButtonModule} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";
import {ActivatedRoute} from "@angular/router";
import {SettingsServiceModule} from "../../services/settings/settings-service.module";

describe('HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    beforeEach(async(() => {
        const fakeActivatedRoute = {
            snapshot: {data: {}, fragment: "/home"}
        } as ActivatedRoute;

        TestBed.configureTestingModule({
            declarations: [HomeComponent],
            imports: [
                BrowserModule,
                BrowserAnimationsModule,

                APIModule,
                SettingsServiceModule,
                FileStatusTableModule,
                TagEditorDialogModule,

                FormsModule,
                ReactiveFormsModule,

                MatFormFieldModule,
                MatInputModule,
                MatSlideToggleModule,
                MatButtonModule,
                MatMenuModule
            ],
            providers: [{provide: ActivatedRoute, useValue: fakeActivatedRoute}]
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
