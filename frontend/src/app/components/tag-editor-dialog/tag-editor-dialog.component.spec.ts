import {FormsModule} from "@angular/forms";
import {MatDialogModule} from "@angular/material";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

import {IonicModule} from "@ionic/angular";

import {TagEditorDialog} from './tag-editor-dialog.component';

describe('TagEditorDialogComponent', () => {
    let component: TagEditorDialog;
    let fixture: ComponentFixture<TagEditorDialog>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TagEditorDialog],
            imports: [
                BrowserAnimationsModule,
                FormsModule,

                IonicModule,

                MatFormFieldModule,
                MatInputModule,
                MatDialogModule,
                MatButtonModule
            ],
            providers: [
                MatDialogModule,
                {provide: MatDialogRef, useValue: {}},
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {
                        id: "sample_id",
                        name: "sample_name",
                        status: "sample_status",
                        startDate: new Date().getTime(),
                        metadata: {
                            title: 'sample_title',
                            album: 'sample_album',
                            artist: 'sample_artist',
                            genre: 'sample_genre'
                        }
                    }
                }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TagEditorDialog);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
