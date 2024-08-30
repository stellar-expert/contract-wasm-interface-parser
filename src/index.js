import {xdr} from '@stellar/stellar-base'
import {parseSectionEntriesXdr} from './xdr-reader'
import {WasmSectionReader} from './wasm-section-reader'
import {parseContractMeta, parseSpec} from './xdr-spec-parser'

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
                res.interfaceVersion = xdr.ScEnvMetaEntry.fromXDR(section.contents).value().toString()
                break
            case 'contractmetav0':
                Object.assign(res, parseContractMeta(parseSectionEntriesXdr(section.contents, xdr.ScMetaEntry)))
                break
            case 'contractspecv0':
                Object.assign(res, parseSpec(parseSectionEntriesXdr(section.contents, xdr.ScSpecEntry)))
                break
        }
    }
    return res
}

const index = {parseContractMetadata}

export default index

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