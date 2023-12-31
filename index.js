import {xdr} from '@stellar/stellar-base'
import {XdrReader} from './src/xdr-reader'
import {WasmSectionReader} from './src/wasm-section-reader'
import {parseContractMeta, parseSpec} from './src/xdr-spec-parser'

/**
 * Parse contract metadata from WASM sections
 * @param {Buffer} rawWasm
 * @return {{}}
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
                Object.assign(res, parseContractMeta(parseEntries(section.contents, xdr.ScMetaEntry)))
                break
            case 'contractspecv0':
                Object.assign(res, parseSpec(parseEntries(section.contents, xdr.ScSpecEntry)))
                break
        }
    }
    return res
}

function parseEntries(buffer, xdrContract) {
    const reader = new XdrReader(buffer)
    const entries = []
    while (!reader.eof) {
        entries.push(xdrContract.read(reader))
    }
    return entries
}