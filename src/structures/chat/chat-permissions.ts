import { Inspect, Inspectable } from "inspectable"
import { TelegramChatPermissions } from "../../generated"

/**
 * Describes actions that a non-administrator user is allowed to take in a
 * chat.
 */
@Inspectable()
export class ChatPermissions {
    constructor(public payload: TelegramChatPermissions) {}

    get [Symbol.toStringTag]() {
        return this.constructor.name
    }

    /**
     * `true`, if the user is allowed to send text messages, contacts, locations
     * and venues
     */
    @Inspect({ compute: true, nullable: false })
    canSendMessages() {
        return !!this.payload.can_send_messages
    }

    /**
     * `true`, if the user is allowed to send audios
     */
    @Inspect({ compute: true, nullable: false })
    canSendAudios() {
        return !!this.payload.can_send_audios
    }

    /**
     * `true`, if the user is allowed to send documents
     */
    @Inspect({ compute: true, nullable: false })
    canSendDocuments() {
        return !!this.payload.can_send_documents
    }

    /**
     * `true`, if the user is allowed to send photos
     */
    @Inspect({ compute: true, nullable: false })
    canSendPhotos() {
        return !!this.payload.can_send_photos
    }

    /**
     * `true`, if the user is allowed to send videos
     */
    @Inspect({ compute: true, nullable: false })
    canSendVideos() {
        return !!this.payload.can_send_videos
    }

    /**
     * `true`, if the user is allowed to send video notes
     */
    @Inspect({ compute: true, nullable: false })
    canSendVideoNotes() {
        return !!this.payload.can_send_video_notes
    }

    /**
     * `true`, if the user is allowed to send voice notes
     */
    @Inspect({ compute: true, nullable: false })
    canSendVoiceNotes() {
        return !!this.payload.can_send_voice_notes
    }

    /**
     * `true`, if the user is allowed to send polls, implies `can_send_messages`
     */
    @Inspect({ compute: true, nullable: false })
    canSendPolls() {
        return !!this.payload.can_send_polls
    }

    /**
     * `true`, if the user is allowed to send animations, games, stickers and use
     * inline bots, implies `can_send_media_messages`
     */
    @Inspect({ compute: true, nullable: false })
    canSendOtherMessages() {
        return !!this.payload.can_send_other_messages
    }

    /**
     * `true`, if the user is allowed to add web page previews to their messages,
     * implies `can_send_media_messages`
     */
    @Inspect({ compute: true, nullable: false })
    canAddWebPagePreviews() {
        return !!this.payload.can_add_web_page_previews
    }

    /**
     * `true`, if the user is allowed to change the chat title, photo and other
     * settings. Ignored in public supergroups
     */
    @Inspect({ compute: true, nullable: false })
    canChangeInfo() {
        return !!this.payload.can_change_info
    }

    /** `true`, if the user is allowed to invite new users to the chat */
    @Inspect({ compute: true, nullable: false })
    canInviteUsers() {
        return !!this.payload.can_invite_users
    }

    /**
     * `true`, if the user is allowed to pin messages. Ignored in public
     * supergroups
     */
    @Inspect({ compute: true, nullable: false })
    canPinMessages() {
        return !!this.payload.can_pin_messages
    }

    /** `true`, if the user is allowed to create forum topics. If omitted defaults to the value of can_pin_messages */
    @Inspect({ compute: true, nullable: false })
    canManageTopics() {
        return !!this.payload.can_manage_topics
    }
}
