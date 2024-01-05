import { Inspect, Inspectable } from "inspectable"
import { Attachment } from "./attachment"

export interface AttachmentData {
    file_id: string
    file_unique_id: string
}
@Inspectable()
export class FileAttachment<
    T extends AttachmentData = AttachmentData,
> extends Attachment {
    protected payload: T

    constructor(payload: T) {
        super()

        this.payload = payload
    }

    /** Identifier for this file, which can be used to download or reuse the file */
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
}
