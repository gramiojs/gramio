import { Inspect, Inspectable } from "inspectable"
import { TelegramVideo } from "../../generated"
import { AttachmentType } from "../../types"
import { FileAttachment } from "./file-attachment"
import { PhotoSize } from "./photo-size"

/** This object represents a video file. */
@Inspectable()
export class VideoAttachment extends FileAttachment<TelegramVideo> {
    attachmentType: AttachmentType = "video"

    /** Video width as defined by sender */
    @Inspect()
    get width() {
        return this.payload.width
    }

    /** Video height as defined by sender */
    @Inspect()
    get height() {
        return this.payload.height
    }

    /** Duration of the video in seconds as defined by sender */
    @Inspect()
    get duration() {
        return this.payload.duration
    }

    /** Video thumbnail */
    @Inspect({ nullable: false })
    get thumbnail() {
        return this.payload.thumbnail
            ? new PhotoSize(this.payload.thumbnail)
            : null
    }

    /** Original filename as defined by sender */
    @Inspect({ nullable: false })
    get fileName() {
        return this.payload.file_name
    }

    /** Mime type of a file as defined by sender */
    @Inspect({ nullable: false })
    get mimeType() {
        return this.payload.mime_type
    }

    /** File size */
    @Inspect({ nullable: false })
    get fileSize() {
        return this.payload.file_size
    }
}
