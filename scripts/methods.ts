import { CodeGenerator, TextEditor } from "./helpers";
import { PropertyRemapper } from "./properties";
import { IBotApi } from "./types";

//TODO: unify and refactor
export class MethodsGenerator {
    static generateMany(methods: IBotApi.IMethod[]) {
        return methods.flatMap(this.generate);
    }

    static generate(method: IBotApi.IMethod) {
        if (!method.arguments?.length) return [];

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
        ];
    }
}
