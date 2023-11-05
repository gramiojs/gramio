import { TelegramUpdate } from "../../generated";
import { Constructor } from "../../types";
import { Context } from "../context";

interface CloneMixinMetadata<P> {
    payload: P;
}

/** This object represents a mixin which has `clone(options?)` method */
class CloneMixin<
    C extends Context & Constructor<C>,
    Options extends Record<string, any>,
> {
    clone(options?: Options) {
        return new (this.constructor as C)({
            bot: this.bot,
            payload: this.payload,
            raw: {
                updateId: this.raw.updateId as number,
                update: this.raw.update as TelegramUpdate,
                type: this.raw.updateType,
            },
            ...options,
        });
    }
}

interface CloneMixin<C, Options>
    extends Context,
        CloneMixinMetadata<Options["payload"]> {}

export { CloneMixin };
