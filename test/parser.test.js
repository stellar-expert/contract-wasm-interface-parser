import examples from './example-contracts.json'
import {parseContractMetadata} from '../index'

describe('Parser', () => {
    test('parse subscription example meta', () => {
        const {subscription} = examples
        const parsed = parseContractMetadata(Buffer.from(subscription.wasm, 'base64'))
        expect(parsed).toEqual(subscription.interface)
    })
    test('parse wasm with docs example meta', () => {
        const {docs} = examples
        const parsed = parseContractMetadata(Buffer.from(docs.wasm, 'base64'))
        expect(parsed).toEqual(docs.interface)
    })
})