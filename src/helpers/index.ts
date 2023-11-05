export const applyMixins = (derivedCtor: any, baseCtors: any[]) => {
    for (const baseCtor of baseCtors) {
        for (const name of Object.getOwnPropertyNames(baseCtor.prototype)) {
            if (name === "constructor") {
                continue;
            }

            if (
                Object.getOwnPropertyDescriptor(derivedCtor.prototype, name) ===
                undefined
            ) {
                Object.defineProperty(
                    derivedCtor.prototype,
                    name,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    Object.getOwnPropertyDescriptor(baseCtor.prototype, name)!,
                );
            }
        }
    }
};
//TODO: rewrite
export const isPlainObject = (object: object): object is Record<string, any> =>
    Object.prototype.toString.call(object) === "[object Object]";

export const filterPayload = (payload: Record<string, any>) => {
    const filteredPayload: Record<string, any> = {};

    for (const [key, value] of Object.entries(payload)) {
        const notEmpty = value !== undefined && value !== null;

        const isEmptyArray = Array.isArray(value) && value.length === 0;

        if (notEmpty && !isEmptyArray) {
            if (isPlainObject(value)) {
                filteredPayload[key] = filterPayload(value);
            } else {
                filteredPayload[key] = value;
            }
        }
    }

    return filteredPayload;
};
