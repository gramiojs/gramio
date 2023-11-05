import { AttachmentType } from "../../types";
import { Poll } from "../poll";

export class PollAttachment extends Poll {
    attachmentType: AttachmentType = "poll";
}
