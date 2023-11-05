import { AttachmentType } from "../../types";
import { Contact } from "../contact";

export class ContactAttachment extends Contact {
    attachmentType: AttachmentType = "contact";
}
