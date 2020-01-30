export class YTDLUtils {
    public static copyObject(object: Object): Object {
        return JSON.parse(JSON.stringify(object));
    }
}
