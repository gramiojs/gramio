import { Inspect, Inspectable } from "inspectable"
import { TelegramSticker } from "../../generated"
import { AttachmentType, Require } from "../../types"
import { File } from "../file"
import { MaskPosition } from "../mask-position"
import { FileAttachment } from "./file-attachment"
import { PhotoSize } from "./photo-size"

/** This object represents a sticker. */
@Inspectable()
export class StickerAttachment extends FileAttachment<TelegramSticker> {
    attachmentType: AttachmentType = "sticker"

    /**
     * Type of the sticker, currently one of `regular`, `mask`, `custom_emoji`.
     *
     * The type of the sticker is independent from its format, which is determined by the fields `is_animated` and `is_video`.
     */
    @Inspect()
    get type() {
        return this.payload.type
    }

    /** Sticker width */
    @Inspect()
    get width() {
        return this.payload.width
    }

    /** Sticker height */
    @Inspect()
    get height() {
        return this.payload.height
    }

    /** `true`, if the sticker is animated */
    @Inspect({ compute: true })
    isAnimated() {
        return this.payload.is_animated
    }

    /** `true`, if the sticker is a video sticker */
    @Inspect({ compute: true })
    isVideo() {
        return this.payload.is_video
    }

    /** Sticker thumbnail in the .WEBP or .JPG format */
    @Inspect({ nullable: false })
    get thumbnail() {
        return this.payload.thumbnail
            ? new PhotoSize(this.payload.thumbnail)
            : null
    }

    /** Emoji associated with the sticker */
    @Inspect({ nullable: false })
    get emoji() {
        return this.payload.emoji
    }

    /** Name of the sticker set to which the sticker belongs */
    @Inspect({ nullable: false })
    get setName() {
        return this.payload.set_name
    }

    /** Is this sticker a premium one? */
    isPremium(): this is Require<this, "premiumAnimation"> {
        return this.payload.premium_animation !== undefined
    }

    /** Premium animation for the sticker, if the sticker is premium */
    @Inspect({ nullable: false })
    get premiumAnimation() {
        return this.payload.premium_animation
            ? new File(this.payload.premium_animation)
            : null
    }

    /** For mask stickers, the position where the mask should be placed */
    @Inspect({ nullable: false })
    get maskPosition() {
        return this.payload.mask_position
            ? new MaskPosition(this.payload.mask_position)
            : null
    }

    /** For custom emoji stickers, unique identifier of the custom emoji */
    @Inspect({ nullable: false })
    get customEmojiId() {
        return this.payload.custom_emoji_id
    }

    /** `true`, if the sticker must be repainted to a text color in messages, the color of the Telegram Premium badge in emoji status, white color on chat photos, or another appropriate color in other places */
    @Inspect({ nullable: false })
    get needs_repainting() {
        return !!this.payload.needs_repainting
    }

    /** File size */
    @Inspect({ nullable: false })
    get fileSize() {
        return this.payload.file_size
    }
}
