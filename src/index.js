import {xdr} from '@stellar/stellar-sdk'
import {WasmSectionReader} from './wasm-section-reader.js'
import {parseContractMeta, parseSpec} from './xdr-spec-parser.js'

/**
 * Parse contract metadata from WASM sections
 * @param {Buffer} rawWasm
 * @return {ParsedWasmMeta}
 */
export function parseContractMetadata(rawWasm) {
    const wasmSectionReader = new WasmSectionReader(rawWasm)
    const sections = wasmSectionReader.readCustomSections()
    const res = {}
    for (const section of sections) {
        switch (section.name) {
            case 'contractenvmetav0':
                const v = xdr.ScEnvMetaEntry.fromXdr(section.contents).value
                res.interfaceVersion = `${v.protocol}.${v.preRelease}`
                break
            case 'contractmetav0':
                Object.assign(res, parseContractMeta(xdr.decodeStream(xdr.ScMetaEntry, section.contents)))
                break
            case 'contractspecv0':
                Object.assign(res, parseSpec(xdr.decodeStream(xdr.ScSpecEntry, section.contents)))
                break
            default:
                res[section.name] = section.contents.toString()
                break
        }
    }
    return res
}

/**
 * @typedef {{}} ParsedWasmMeta
 * @property {{}} functions
 * @property {{}} [errors]
 * @property {{}} [enums]
 * @property {{}} [structs]
 * @property {{}} [unions]
 * @property {string} rustVersion
 * @property {string} sdkVersion
 * @property {string} interfaceVersion
 */