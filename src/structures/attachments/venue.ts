import { applyMixins } from "../../helpers"
import { AttachmentType } from "../../types"
import { Venue } from "../venue"
import { Attachment } from "./attachment"

export class VenueAttachment extends Venue {
    attachmentType: AttachmentType = "venue"
}

export interface VenueAttachment extends Attachment {}
applyMixins(VenueAttachment, [Attachment])
