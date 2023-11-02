import { CodeGenerator, TextEditor } from "./helpers";
import { typesRemapper } from "./properties";
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
            !method.arguments?.length
                ? `${method.name}: TCallApiWithoutParams<${typesRemapper[
                      method.return_type.type
                  ](method.return_type, method, "method")}>;`
                : `${method.name}: TCallApi<Params.${
                      TextEditor.uppercaseFirstLetter(method.name) + "Params"
                  }, ${typesRemapper[method.return_type.type](
                      method.return_type,
                      method,
                      "method",
                  )}>;`,
        ];
    }
}
