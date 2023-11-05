import { Inspect, Inspectable } from "inspectable";
import { TelegramPhotoSize } from "../../generated";

/** This object represents one size of a photo or a file / sticker thumbnail */
@Inspectable()
export class PhotoSize {
    constructor(public payload: TelegramPhotoSize) {}

    get [Symbol.toStringTag]() {
        return this.constructor.name;
    }

    /**
     * Identifier for this file, which can be used to download or reuse the file
     */
    @Inspect()
    get fileId() {
        return this.payload.file_id;
    }

    /**
     * Unique identifier for this file, which is supposed to be the same over
     * time and for different bots. Can't be used to download or reuse the file.
     */
    @Inspect()
    get fileUniqueId() {
        return this.payload.file_unique_id;
    }

    /** Photo width */
    @Inspect()
    get width() {
        return this.payload.width;
    }

    /** Photo height */
    @Inspect()
    get height() {
        return this.payload.height;
    }

    /** File size */
    @Inspect({ nullable: false })
    get fileSize() {
        return this.payload.file_size;
    }
}
