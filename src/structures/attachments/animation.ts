import type { TelegramAnimation } from "@gramio/types"
import { Inspect } from "inspectable"
import { AttachmentType } from "../../types"
import { FileAttachment } from "./file-attachment"
import { PhotoSize } from "./photo-size"

export class AnimationAttachment extends FileAttachment<TelegramAnimation> {
    attachmentType: AttachmentType = "animation"

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

    /** Animation thumbnail as defined by sender */
    @Inspect({ nullable: false })
    get thumbnail() {
        return this.payload.thumbnail
            ? new PhotoSize(this.payload.thumbnail)
            : null
    }

    /** Original animation filename as defined by sender */
    @Inspect({ nullable: false })
    get fileName() {
        return this.payload.file_name
    }

    /** MIME type of the file as defined by sender */
    @Inspect({ nullable: false })
    get mimeType() {
        return this.payload.mime_type
    }

    /** File size */
    @Inspect({ nullable: false })
    get fileSize() {
        return this.payload.file_size
    }

    toJSON() {
        return this.payload
    }
}
