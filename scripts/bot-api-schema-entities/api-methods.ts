import { CodeGenerator, TextEditor } from "../helpers";
import { IBotApi } from "../types";
import { typesRemapper } from "./properties";

function generateMethod(method: IBotApi.IMethod) {
    const returnType = typesRemapper[method.return_type.type](
        method.return_type,
        method,
        "method",
    );

    if (!method.arguments?.length)
        return `${method.name}: TCallApiWithoutParams<${returnType}>;`;

    const tCallType = method.arguments.some((argument) => !argument.required)
        ? "TCallApiWithOptionalParams"
        : "TCallApi";

    return `${method.name}: ${tCallType}<Params.${
        TextEditor.uppercaseFirstLetter(method.name) + "Params"
    }, ${returnType}>;`;
}

export class ApiMethods {
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
            generateMethod(method),
        ];
    }
}
