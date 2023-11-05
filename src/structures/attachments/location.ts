import { AttachmentType } from "../../types";
import { Location } from "../location";

export class LocationAttachment extends Location {
    attachmentType?: AttachmentType = "location";
}
