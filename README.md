# @stellar-expert/contract-wasm-interface-parser

> Lightweight contract interface metadata parser for Soroban binary WASM

## Installation

```shell
npm i @stellar-expert/contract-wasm-interface-parser
```

## Usage

Download WASM contract code and call `parseContractMetadata()` function to obtain a parsed contract interface.

```js
parseContractMetadata(Buffer.from(/*binary wasm code*/))
```

Example output:

```json
{
  "unions": [
    {
      "name": "Asset",
      "cases": {
        "Stellar": [
          "address"
        ],
        "Other": [
          "symbol"
        ]
      }
    }
  ],
  "structs": [
    {
      "name": "TickerAsset",
      "fields": [
        {
          "name": "asset",
          "type": "Asset",
          "doc": "Short ticker name of the asset"
        },
        {
          "name": "source",
          "type": "string",
          "doc": "Data provider ID"
        }
      ]
    }
  ],
  "errors": [
    {
      "name": "Error",
      "cases": [
        {
          "name": "AlreadyInitialized",
          "value": 0
        },
        {
          "name": "Unauthorized",
          "value": 1
        }
      ]
    }
  ],
  "enums": [
    {
      "name": "SubscriptionStatus",
      "cases": {
        "Active": 0,
        "Suspended": 1,
        "Cancelled": 2
      }
    }
  ],
  "functions": [
    {
      "name": "config",
      "inputs": [
        {
          "name": "config",
          "type": "ConfigData"
          "doc": "New configuration data"
        }
      ],
      "outputs": [],
      "doc": "Update contract confirguration"
    },
    {
      "name": "set_fee",
      "inputs": [
        {
          "name": "fee",
          "type": "u64"
        }
      ],
      "outputs": []
    },
    {
      "name": "get_subscription",
      "inputs": [
        {
          "name": "subscription_id",
          "type": "u64"
        }
      ],
      "outputs": [
        "Subscription"
      ]
    }
  ],
  "interfaceVersion": "85899345920",
  "rustVersion": "1.74.0",
  "sdkVersion": "20.5.0#9e2c3022b4355b224a7a814e13ba51761eeb14bb"
}
```