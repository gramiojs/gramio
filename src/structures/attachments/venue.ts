import { AttachmentType } from "../../types";
import { Venue } from "../venue";

export class VenueAttachment extends Venue {
    attachmentType: AttachmentType = "venue";
}
