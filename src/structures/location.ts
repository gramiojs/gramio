import { Inspect, Inspectable } from "inspectable"
import { TelegramLocation } from "../generated"

/** This object represents a point on the map. */
@Inspectable()
export class Location {
    constructor(public payload: TelegramLocation) {}

    get [Symbol.toStringTag]() {
        return this.constructor.name
    }

    /** Longitude as defined by sender */
    @Inspect()
    get longitude() {
        return this.payload.longitude
    }

    /** Latitude as defined by sender */
    @Inspect()
    get latitude() {
        return this.payload.latitude
    }

    /** The radius of uncertainty for the location, measured in meters; `0-1500` */
    @Inspect()
    get horizontalAccuracy() {
        return this.payload.horizontal_accuracy
    }

    /**
     * Time relative to the message sending date,
     * during which the location can be updated, in seconds.
     * For active live locations only.
     */
    @Inspect()
    get livePeriod() {
        return this.payload.live_period
    }

    /**
     * The direction in which user is moving, in degrees; `1-360`.
     * For active live locations only.
     */
    @Inspect()
    get heading() {
        return this.payload.heading
    }

    /**
     * Maximum distance for proximity alerts about approaching another chat member, in meters.
     * For sent live locations only.
     */
    @Inspect()
    get proximityAlertRadius() {
        return this.payload.proximity_alert_radius
    }
}
