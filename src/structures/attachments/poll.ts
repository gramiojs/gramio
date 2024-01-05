import { applyMixins } from "../../helpers"
import { AttachmentType } from "../../types"
import { Poll } from "../poll"
import { Attachment } from "./attachment"

export class PollAttachment extends Poll {
    attachmentType: AttachmentType = "poll"
}

export interface PollAttachment extends Attachment {}
applyMixins(PollAttachment, [Attachment])
