/**
 * Parse contract interface metadata from binary Soroban contract WASM.
 * @param rawWasm - Raw WASM binary contract code.
 * @returns Parsed contract interface metadata.
 */
export function parseContractMetadata(rawWasm: Uint8Array): ParsedWasmMeta

/**
 * Rust type notation or a user-defined type definition.
 */
export type ParsedTypeName = string

export interface DocumentedEntry {
    /** Documentation comment attached to the entry, if present. */
    doc?: string
}

export interface FunctionArgument extends DocumentedEntry {
    name: string
    type: ParsedTypeName
}

export interface FunctionSpec extends DocumentedEntry {
    inputs: FunctionArgument[]
    outputs: ParsedTypeName[]
}

export interface StructFieldSpec extends DocumentedEntry {
    type: ParsedTypeName
}

export interface StructSpec extends DocumentedEntry {
    fields: {
        [fieldName: string]: StructFieldSpec
    }
}

export interface UnionSpec extends DocumentedEntry {
    cases: {
        [caseName: string]: ParsedTypeName[]
    }
}

export interface EnumCaseSpec extends DocumentedEntry {
    value: number
}

export interface EnumSpec extends DocumentedEntry {
    cases: {
        [caseName: string]: EnumCaseSpec
    }
}

export interface ErrorCaseSpec extends DocumentedEntry {
    value: number
}

export type ErrorsSpec = {
    [errorName: string]: ErrorCaseSpec
}

export type EventDataFormat = 'Vec' | 'Map' | string

export type EventParamLocation = 'data' | 'topics'

export interface EventParamSpec extends DocumentedEntry {
    name: string
    type: ParsedTypeName
    location: EventParamLocation
}

export interface EventSpec extends DocumentedEntry {
    prefixTopics: string[]
    params: EventParamSpec[]
    dataFormat: EventDataFormat
}

export interface ParsedWasmMeta {
    functions?: {
        [functionName: string]: FunctionSpec
    }
    structs?: {
        [structName: string]: StructSpec
    }
    unions?: {
        [unionName: string]: UnionSpec
    }
    enums?: {
        [enumName: string]: EnumSpec
    }
    errors?: ErrorsSpec
    events?: {
        [eventName: string]: EventSpec
    }
    /** Rust compiler version used to build the contract. */
    rustVersion?: string
    /** Soroban Rust SDK version used to build the contract. */
    sdkVersion?: string
    /** Soroban environment interface version, in `<protocol>.<preRelease>` format. */
    interfaceVersion?: string
    /** Any other `contractmetav0` entries or raw custom section contents. */
    [key: string]: unknown
}
