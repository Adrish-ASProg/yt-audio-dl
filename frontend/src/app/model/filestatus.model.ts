import {Mp3Metadata} from "./mp3metadata.model";

export interface FileStatus {
    id: string;
    name: string;
    status: string;
    startDate: number;
    metadata?: Mp3Metadata;
}
