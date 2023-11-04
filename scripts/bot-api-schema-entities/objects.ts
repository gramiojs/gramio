import { OBJECTS_PREFIX } from "../config";
import { CodeGenerator, TextEditor } from "../helpers";
import { IBotApi } from "../types";
import { Properties } from "./properties";

export class Objects {
    static generateMany(objects: IBotApi.IObject[]) {
        return objects.flatMap(this.generate);
    }

    static generate(object: IBotApi.IObject) {
        if (!object.properties?.length)
            return [
                "",
                ...CodeGenerator.generateComment(
                    object.description +
                        `\n\n{@link ${object.documentation_link} | [Documentation]}`,
                ),
                `export interface ${OBJECTS_PREFIX + object.name} {}`,
                "",
            ];

        const unionTypes = object.properties
            .filter((property) => property.enumeration)
            .map((property) =>
                CodeGenerator.generateUnionType(
                    OBJECTS_PREFIX +
                        object.name +
                        TextEditor.uppercaseFirstLetter(
                            TextEditor.fromSnakeToCamelCase(property.name),
                        ),
                    property.enumeration as string[],
                ),
            );

        return [
            ...unionTypes,
            "",
            ...CodeGenerator.generateComment(
                object.description +
                    `\n\n{@link ${object.documentation_link} | [Documentation]}`,
            ),
            `export interface ${OBJECTS_PREFIX + object.name} {`,
            ...Properties.convertMany(
                object,
                object.properties,
                "object",
            ).flat(),
            "}",
            "",
        ];
    }
}
