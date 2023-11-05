import { Inspect, Inspectable } from "inspectable";
import { TelegramVenue } from "../generated";
import { Location } from "./location";

/** This object represents a venue. */
@Inspectable()
export class Venue {
    constructor(public payload: TelegramVenue) {}

    get [Symbol.toStringTag]() {
        return this.constructor.name;
    }

    /** Venue location */
    @Inspect()
    get location() {
        return new Location(this.payload.location);
    }

    /** Name of the venue */
    @Inspect()
    get title() {
        return this.payload.title;
    }

    /** Address of the venue */
    @Inspect()
    get address() {
        return this.payload.address;
    }

    /** Foursquare identifier of the venue */
    @Inspect({ nullable: false })
    get foursquareId() {
        return this.payload.foursquare_id;
    }

    /** Foursquare type of the venue */
    @Inspect({ nullable: false })
    get foursquareType() {
        return this.payload.foursquare_type;
    }

    /** Google Places identifier of the venue */
    @Inspect({ nullable: false })
    get googlePlaceId() {
        return this.payload.google_place_id;
    }

    /**
     * Google Places type of the venue.
     * (See [supported types](https://developers.google.com/places/web-service/supported_types).)
     */
    @Inspect({ nullable: false })
    get googlePlaceType() {
        return this.payload.google_place_type;
    }
}
