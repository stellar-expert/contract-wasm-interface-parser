import {xdr} from '@stellar/stellar-sdk'
import {parseSectionEntriesXdr} from './xdr-reader.js'
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
                const v = xdr.ScEnvMetaEntry.fromXDR(section.contents).value()._attributes
                res.interfaceVersion = `${v.protocol}.${v.preRelease}`
                break
            case 'contractmetav0':
                Object.assign(res, parseContractMeta(parseSectionEntriesXdr(section.contents, xdr.ScMetaEntry)))
                break
            case 'contractspecv0':
                Object.assign(res, parseSpec(parseSectionEntriesXdr(section.contents, xdr.ScSpecEntry)))
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