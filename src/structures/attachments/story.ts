import { applyMixins } from "../../helpers"
import { AttachmentType } from "../../types"
import { Story } from "../story"
import { Attachment } from "./attachment"

export class StoryAttachment extends Story {
    attachmentType: AttachmentType = "story"
}
export interface StoryAttachment extends Attachment {}
applyMixins(StoryAttachment, [Attachment])
