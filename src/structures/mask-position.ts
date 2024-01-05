import { Inspect, Inspectable } from "inspectable"
import { TelegramMaskPosition } from "../generated"

/**
 * This object describes the position on faces where a mask should be placed
 * by default.
 */
@Inspectable()
export class MaskPosition {
    constructor(public payload: TelegramMaskPosition) {}

    get [Symbol.toStringTag]() {
        return this.constructor.name
    }

    /**
     * The part of the face relative to which the mask should be placed.
     * One of `forehead`, `eyes`, `mouth`, or `chin`.
     */
    @Inspect()
    get point() {
        return this.payload.point
    }

    /**
     * Shift by X-axis measured in widths of the mask scaled to the face size,
     * from left to right. For example, choosing `-1.0` will place mask just to
     * the left of the default mask position.
     */
    @Inspect()
    get xShift() {
        return this.payload.x_shift
    }

    /**
     * Shift by Y-axis measured in heights of the mask scaled to the face size,
     * from top to bottom. For example, `1.0` will place the mask just below the
     * default mask position.
     */
    @Inspect()
    get yShift() {
        return this.payload.y_shift
    }

    /** Mask scaling coefficient. For example, `2.0` means double size. */
    @Inspect()
    get scale() {
        return this.payload.scale
    }
}
