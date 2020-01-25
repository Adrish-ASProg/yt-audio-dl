import {Mp3Metadata} from "./mp3metadata.model";

export interface FileStatus {
    uuid: string;
    name: string;
    status: string;
    startDate: number;
    metadata: Mp3Metadata;
}
