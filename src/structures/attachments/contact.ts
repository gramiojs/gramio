import { applyMixins } from "../../helpers"
import { AttachmentType } from "../../types"
import { Contact } from "../contact"
import { Attachment } from "./attachment"

export class ContactAttachment extends Contact {
    attachmentType: AttachmentType = "contact"
}

//[INFO] as mixins because attachment already extends another class)
export interface ContactAttachment extends Attachment {}
applyMixins(ContactAttachment, [Attachment])
