import { OBJECTS_PREFIX } from "./config";
import { CodeGenerator, TextEditor } from "./helpers";
import { PropertyRemapper, typesRemapper } from "./properties";
import { IBotApi } from "./types";

//TODO: унифицировать многое
export class MethodsGenerator {
    static generateMany(methods: IBotApi.IMethod[]) {
        return methods.flatMap(this.generate);
    }

    static generate(method: IBotApi.IMethod) {
        if (!method.arguments?.length)
            return [
                `export type ${TextEditor.uppercaseFirstLetter(
                    method.name,
                )} = () => Promise<${typesRemapper[method.return_type.type](
                    method.return_type,
                    method,
                    "method",
                )}>`,
            ];

        const unionTypes = method.arguments
            .filter((argument) => argument.enumeration)
            .map((argument) =>
                CodeGenerator.generateUnionType(
                    TextEditor.uppercaseFirstLetter(method.name) +
                        TextEditor.uppercaseFirstLetter(
                            TextEditor.fromSnakeToCamelCase(argument.name),
                        ),
                    argument.enumeration as string[],
                ),
            );

        return [
            ...unionTypes,
            "",
            `export interface ${
                TextEditor.uppercaseFirstLetter(method.name) + "Params"
            } {`,
            ...PropertyRemapper.convertMany(
                method,
                method.arguments,
                "method",
            ).flat(),
            "}",
            "",
            ...CodeGenerator.generateComment(
                method.description +
                    `\n\n{@link ${method.documentation_link} | [Documentation]}`,
            ),
            `export type ${TextEditor.uppercaseFirstLetter(
                method.name,
            )} = (params: ${TextEditor.uppercaseFirstLetter(
                method.name + "Params",
            )}) => Promise<${typesRemapper[method.return_type.type](
                method.return_type,
                method,
                "method",
            )}>`,
            "",
        ];
    }
}
