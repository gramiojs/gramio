import { Inspect, Inspectable } from "inspectable"
import { TelegramChatPhoto } from "../../generated"

//TODO: maybe add a file struct

/** This object represents a chat photo. */
@Inspectable()
export class ChatPhoto {
    constructor(public payload: TelegramChatPhoto) {}

    get [Symbol.toStringTag]() {
        return this.constructor.name
    }

    /**
     * File identifier of small (`160x160`) chat photo.
     * This `file_id` can be used only for photo download and only for as long
     * as the photo is not changed.
     */
    @Inspect()
    get smallFileId() {
        return this.payload.small_file_id
    }

    /**
     * Unique file identifier of small (`160x160`) chat photo, which is supposed
     * to be the same over time and for different bots. Can't be used to download
     * or reuse the file.
     */
    @Inspect()
    get smallFileUniqueId() {
        return this.payload.small_file_unique_id
    }

    /**
     * File identifier of big (`640x640`) chat photo. This `file_id` can be used
     * only for photo download and only for as long as the photo is not changed.
     */
    @Inspect()
    get bigFileId() {
        return this.payload.big_file_id
    }

    /**
     * Unique file identifier of big (`640x640`) chat photo, which is supposed
     * to be the same over time and for different bots. Can't be used to
     * download or reuse the file.
     */
    @Inspect()
    get bigFileUniqueId() {
        return this.payload.big_file_unique_id
    }
}
