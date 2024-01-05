import type { TelegramVoice } from "@gramio/types"
import { Inspect, Inspectable } from "inspectable"
import { AttachmentType } from "../../types"
import { FileAttachment } from "./file-attachment"

/** This object represents a voice note. */
@Inspectable()
export class VoiceAttachment extends FileAttachment<TelegramVoice> {
    attachmentType: AttachmentType = "voice"

    /** Duration of the audio in seconds as defined by sender */
    @Inspect()
    get duration() {
        return this.payload.duration
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
