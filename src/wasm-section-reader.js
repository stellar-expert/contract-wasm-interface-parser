/**
 * Minimalistic WASM metadata reader
 */
export class WasmSectionReader {
    constructor(data) {
        this.data = data
    }

    /**
     * @type {Buffer}
     * @private
     */
    data
    /**
     * Current reader position
     * @type {number}
     * @private
     */
    pointer = 8

    /**
     * Read custom metadata sections from raw WASM
     * @return {{name: string, contents: Buffer}[]}
     */
    readCustomSections() {
        const sections = []
        while (this.pointer < this.data.length) {
            const sectionType = this.readUint8()
            let length = this.readVarUint32()
            if (sectionType === 0) { //accumulate only custom sections
                const sectionStart = this.pointer
                const name = this.readString()
                length -= this.pointer - sectionStart
                sections.push({
                    name,
                    contents: this.data.subarray(this.pointer, this.pointer + length)
                })
            }
            this.pointer += length
        }
        return sections
    }

    /**
     * @return {number}
     * @private
     */
    readUint8() {
        return this.data.readUint8(this.pointer++)
    }

    /**
     * @return {number}
     * @private
     */
    readVarUint32() {
        let result = 0
        let shift = 0
        while (true) {
            let byte = this.readUint8()
            result |= (byte & 0x7f) << shift
            shift += 7
            if ((byte & 0x80) === 0)
                break
        }
        return result >>> 0
    }

    /**
     * @return {string}
     * @private
     */
    readString() {
        const length = this.readVarUint32()
        const contents = this.data.subarray(this.pointer, this.pointer + length)
        this.pointer += length
        return contents.toString('utf-8')
    }
}