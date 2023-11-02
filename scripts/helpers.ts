export class CodeGenerator {
    static generateComment(value: string) {
        const valueLines = value.split("\n");

        return [`/**`, valueLines.map((line) => "* " + line).join("\n"), `*/`];
    }

    static generateUnionType(name: string, enumeration: string[]) {
        return `export type ${name} = ${enumeration
            .map((value) => `"` + value + `"`)
            .join(" | ")}`;
    }
}

export class TextEditor {
    static uppercaseFirstLetter(text: string) {
        return text.at(0)?.toUpperCase() + text.slice(1);
    }

    static fromSnakeToCamelCase(text: string) {
        return text
            .split("_")
            .reduce(
                (prev, current, i) =>
                    i === 0
                        ? current
                        : prev + this.uppercaseFirstLetter(current),
                "",
            );
    }
}
