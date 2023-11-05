import { Inspect } from "inspectable";
import { AttachmentType } from "../../types";

export interface AttachmentData {
    file_id: string;
    file_unique_id: string;
}

export class FileAttachment<T extends AttachmentData = AttachmentData> {
    protected payload: T;
    /** Returns attachment's type (e.g. `'audio'`, `'photo'`) */
    attachmentType?: AttachmentType;

    constructor(payload: T) {
        this.payload = payload;
    }

    /** Identifier for this file, which can be used to download or reuse the file */
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
}
