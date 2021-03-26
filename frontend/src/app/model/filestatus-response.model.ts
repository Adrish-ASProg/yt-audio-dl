import {FileStatus} from "./filestatus.model";

export interface FileStatusResponse {
    totalLength: number;
    filesStatus: FileStatus[];
}
