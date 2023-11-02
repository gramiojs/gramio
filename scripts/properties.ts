import { OBJECTS_PREFIX } from "./config";
import { CodeGenerator, TextEditor } from "./helpers";
import { IBotApi, TObjectType } from "./types";

type TTypeRemapper = Record<
    IBotApi.IType,
    (
        property: IBotApi.IProperty,
        object: IBotApi.IObject,
        objectType: TObjectType,
    ) => string
>;
//TODO: json schema to (T, params[T])
export const typesRemapper: TTypeRemapper = {
    float: () => "number",
    integer: () => "number",
    //[INFO] no need in enumeration because union types generate before that
    string: (property: IBotApi.IProperty, object, objectType) => {
        if (property.enumeration)
            return (
                (objectType === "object" ? OBJECTS_PREFIX : "") +
                TextEditor.uppercaseFirstLetter(object.name) +
                TextEditor.uppercaseFirstLetter(
                    TextEditor.fromSnakeToCamelCase(property.name),
                )
            );

        return "string";
    },
    bool: () => "boolean",
    //[INFO] Reference to other object.
    reference: (property, _, objectType) => {
        return (
            (objectType === "object" ? "" : "Objects.") +
            OBJECTS_PREFIX +
            TextEditor.uppercaseFirstLetter(property.reference!)
        );
    },
    any_of: (property, object, objectType) => {
        return property
            .any_of!.map((x) => typesRemapper[x.type](x, object, objectType))
            .join(" | ");
    },
    array: (property, object, objectType) => {
        const type = typesRemapper[property.array!.type](
            property.array!,
            object,
            objectType,
        );

        return type + "[]";
    },
};

export class PropertyRemapper {
    static convertMany(
        object: IBotApi.IObject,
        properties: IBotApi.IProperty[],
        objectType: TObjectType,
    ) {
        return properties.map((property) =>
            this.convert(object, property, objectType),
        );
    }

    static convert(
        object: IBotApi.IObject,
        property: IBotApi.IProperty,
        objectType: TObjectType,
    ) {
        const type = typesRemapper[property.type](property, object, objectType);

        return [
            ...CodeGenerator.generateComment(property.description),
            `${property.name + (!property.required ? "?" : "")}: ${type};`,
        ];
    }
}
