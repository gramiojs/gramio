import fs from "node:fs/promises";
import prettier from "prettier";
import { request } from "undici";
import { ApiMethods, Methods, Objects } from "./bot-api-schema-entities";
import { BOT_API_SCHEMA_URL, PRETTIER_OPTIONS } from "./config";
import { IBotApi } from "./types";

export interface IGeneratedFile {
    path: string;
    lines: string[][];
}

request(BOT_API_SCHEMA_URL)
    .then((res) => res.body.json())
    .then(async (data) => {
        const botApiSchema = data as IBotApi.ISchema;

        const header = generateHeader(
            botApiSchema.version,
            botApiSchema.recent_changes,
        );

        const files: IGeneratedFile[] = [
            {
                path: "./src/generated/objects.ts",
                lines: [header, Objects.generateMany(botApiSchema.objects)],
            },
            {
                path: "./src/generated/api-params.ts",
                lines: [
                    header,
                    [`import * as Objects from "./objects";`, ""],
                    Methods.generateMany(botApiSchema.methods),
                ],
            },
            {
                path: "./src/generated/api-methods.ts",
                lines: [
                    header,
                    [
                        `import * as Params from "./api-params"`,
                        `import * as Objects from "./objects";`,
                        "",
                        "type TCallApi<T, R> = (params: T) => Promise<R>;",
                        "type TCallApiWithoutParams<R> = () => Promise<R>;",
                        "type TCallApiWithOptionalParams<T, R> = (params?: T) => Promise<R>;",
                        "",
                    ],

                    ApiMethods.generateMany(botApiSchema.methods),
                ],
            },
            {
                path: "./src/generated/index.ts",
                lines: [
                    [`export * from "./api-methods"`],
                    [`export * from "./api-params"`],
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

export function generateHeader(
    version: IBotApi.IVersion,
    recentChanges: IBotApi.IRecentChangesObject,
) {
    return [
        `/**`,
        `* Based on Bot Api v${version.major}.${version.minor}.${version.patch} (${recentChanges.day}.${recentChanges.month}.${recentChanges.year})`,
        `* Generated at ${new Date().toLocaleString()} using {@link https://ark0f.github.io/tg-bot-api | [this repository]}`,
        `*/`,
    ];
}
