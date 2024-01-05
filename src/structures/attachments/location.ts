import { applyMixins } from "../../helpers"
import { AttachmentType } from "../../types"
import { Location } from "../location"
import { Attachment } from "./attachment"

export class LocationAttachment extends Location {
    attachmentType?: AttachmentType = "location"
}

export interface LocationAttachment extends Attachment {}
applyMixins(LocationAttachment, [Attachment])
