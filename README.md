# @stellar-expert/contract-wasm-interface-parser

> Lightweight contract interface metadata parser for Soroban binary WASM

## Installation

```shell
npm i @stellar-expert/contract-wasm-interface-parser
```

## Usage

```js
parseContractMetadata(Buffer.from(/*binary wasm code*/))
/*{
    rustVersion: '1.76.0',
    sdkVersion: '20.0.0',
    functions: [],
    enums: [],
    structs: [],
    unions: [],
    errors: []
}*/
```