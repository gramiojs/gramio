export type TObjectType = "object" | "method";

export namespace IBotApi {
    export interface ISchema {
        methods: IMethod[];
        objects: IObject[];
        recent_changes: IRecentChangesObject;
        version: IVersion;
        [property: string]: any;
    }

    export interface IMethod {
        arguments?: IArgument[] | null;
        description: string;
        documentation_link: string;
        multipart_only: boolean;
        name: string;
        return_type: IArgument;
        [property: string]: any;
    }

    export interface IArgument {
        description: string;
        name: string;
        required: boolean;
        default?: boolean | number | null | string;
        max?: number | null;
        min?: number | null;
        type: IType;
        enumeration?: string[] | null;
        max_len?: number | null;
        min_len?: number | null;
        any_of?: IArgument[] | null;
        reference?: string;
        array?: IArgument;
        [property: string]: any;
    }

    export type IType =
        | "integer"
        | "string"
        | "bool"
        | "float"
        | "any_of"
        | "reference"
        | "array";

    export interface IObject {
        description: string;
        documentation_link: string;
        name: string;
        properties?: IProperty[];
        type?: string;
        any_of?: IArgument[];
        [property: string]: any;
    }

    export interface IProperty {
        description: string;
        name: string;
        required: boolean;
        default?: boolean | number | null | string;
        max?: number | null;
        min?: number | null;
        type: IType;
        enumeration?: string[] | null;
        max_len?: number | null;
        min_len?: number | null;
        any_of?: IArgument[] | null;
        reference?: string;
        array?: IArgument;
        [property: string]: any;
    }

    export interface IRecentChangesObject {
        day: number;
        month: number;
        year: number;
        [property: string]: any;
    }

    export interface IVersion {
        major: number;
        minor: number;
        patch: number;
        [property: string]: any;
    }
}
