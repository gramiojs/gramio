import { Inspect, Inspectable } from "inspectable"
import { TelegramFile } from "../generated"

/** This object represents a file ready to be downloaded. The file can be downloaded via the link `https://api.telegram.org/file/bot<token>/<file_path>`. It is guaranteed that the link will be valid for at least 1 hour. When the link expires, a new one can be requested by calling `getFile`. */
@Inspectable()
export class File {
    constructor(public payload: TelegramFile) {}

    get [Symbol.toStringTag]() {
        return this.constructor.name
    }

    /**
     * Identifier for this file, which can be used to download or reuse the file
     */
    @Inspect()
    get fileId() {
        return this.payload.file_id
    }

    /**
     * Unique identifier for this file, which is supposed to be the same over
     * time and for different bots. Can't be used to download or reuse the file.
     */
    @Inspect()
    get fileUniqueId() {
        return this.payload.file_unique_id
    }

    /** File size, if known */
    @Inspect()
    get fileSize() {
        return this.payload.file_size
    }

    /**
     * File path.
     * Use `https://api.telegram.org/file/bot<token>/<file_path>` to get the
     * file.
     */
    @Inspect({ nullable: false })
    get filePath() {
        return this.payload.file_path
    }
}
