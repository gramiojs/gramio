import { OBJECTS_PREFIX } from "./config";
import { CodeGenerator, TextEditor } from "./helpers";
import { PropertyRemapper } from "./properties";
import { IBotApi } from "./types";

export class ObjectGenerator {
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
            ...PropertyRemapper.convertMany(
                object,
                object.properties,
                "object",
            ).flat(),
            "}",
            "",
        ];
    }
}
