import type { TelegramDocument } from "@gramio/types"
import { Inspect } from "inspectable"
import { AttachmentType } from "../../types"
import { FileAttachment } from "./file-attachment"
import { PhotoSize } from "./photo-size"

export class DocumentAttachment extends FileAttachment<TelegramDocument> {
    attachmentType: AttachmentType = "document"

    /** Document thumbnail as defined by sender */
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
}
