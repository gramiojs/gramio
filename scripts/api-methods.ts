import { CodeGenerator, TextEditor } from "./helpers";
import { IBotApi } from "./types";

export class ApiMethodsGenerator {
    static generateMany(methods: IBotApi.IMethod[]) {
        return [
            `export interface ApiMethods {`,
            ...methods.flatMap(this.generate),
            "}",
        ];
    }

    static generate(method: IBotApi.IMethod) {
        return [
            ...CodeGenerator.generateComment(
                method.description +
                    `\n\n{@link ${method.documentation_link} | [Documentation]}`,
            ),
            `${method.name}: Api.${TextEditor.uppercaseFirstLetter(
                method.name,
            )};`,
        ];
    }
}
