import { Inspect, Inspectable } from "inspectable";
import { TelegramVideoNote } from "../../generated";
import { AttachmentType } from "../../types";
import { FileAttachment } from "./file-attachment";
import { PhotoSize } from "./photo-size";

/** This object represents a video message. */
@Inspectable()
export class VideoNoteAttachment extends FileAttachment<TelegramVideoNote> {
    attachmentType: AttachmentType = "video_note";

    /**
     * Video width and height (diameter of the video message) as defined by
     * sender
     */
    @Inspect()
    get length() {
        return this.payload.length;
    }

    /** Duration of the video in seconds as defined by sender */
    @Inspect()
    get duration() {
        return this.payload.duration;
    }

    /** Video thumbnail */
    @Inspect({ nullable: false })
    get thumbnail() {
        return this.payload.thumbnail
            ? new PhotoSize(this.payload.thumbnail)
            : null;
    }

    /** File size */
    @Inspect({ nullable: false })
    get fileSize() {
        return this.payload.file_size;
    }
}
