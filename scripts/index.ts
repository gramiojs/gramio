import fs from "node:fs/promises";
import prettier from "prettier";
import { request } from "undici";
import { ApiMethodsGenerator } from "./api-methods";
import { BOT_API_SCHEMA_URL, PRETTIER_OPTIONS } from "./config";
import { MethodsGenerator } from "./methods";
import { ObjectGenerator } from "./objects";
import { IBotApi } from "./types";

export interface IGeneratedFile {
    path: string;
    lines: string[][];
}

request(BOT_API_SCHEMA_URL)
    .then((res) => res.body.json())
    .then(async (data) => {
        const botApiSchema = data as IBotApi.ISchema;

        const files: IGeneratedFile[] = [
            {
                path: "./src/generated/objects.ts",
                lines: [
                    generateHeader(botApiSchema.version),
                    ObjectGenerator.generateMany(botApiSchema.objects),
                ],
            },
            {
                path: "./src/generated/methods.ts",
                lines: [
                    generateHeader(botApiSchema.version),
                    [`import * as Objects from "./objects";`],
                    MethodsGenerator.generateMany(botApiSchema.methods),
                ],
            },
            {
                path: "./src/generated/api-methods.ts",
                lines: [
                    generateHeader(botApiSchema.version),
                    [`import * as Api from "./methods"`, ""],

                    ApiMethodsGenerator.generateMany(botApiSchema.methods),
                ],
            },
            {
                path: "./src/generated/index.ts",
                lines: [
                    [`export * from "./api-methods"`],
                    [`export * from "./methods"`],
                    [`export * from "./objects"`],
                ],
            },
        ];

        for await (const file of files) {
            await fs.writeFile(
                file.path,
                // file.lines.flat().join("\n"),
                await prettier.format(
                    file.lines.flat().join("\n"),
                    PRETTIER_OPTIONS,
                ),
            );
        }
    });

export function generateHeader(version: IBotApi.IVersion) {
    return [
        `// Based on Bot Api v${version.major}.${version.minor}.${version.patch}`,
    ];
}
