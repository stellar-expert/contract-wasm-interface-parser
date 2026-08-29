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
  "unions": {
    "Asset": {
      "cases": {
        "Stellar": [
          "Address"
        ],
        "Other": [
          "Symbol"
        ]
      }
    }
  },
  "structs": {
    "TickerAsset": {
      "fields": {
        "asset": {
          "type": "Asset"
        },
        "source": {
          "type": "String"
        }
      }
    },
    "Subscription": {
      "fields": {
        "asset1": {
          "type": "TickerAsset"
        },
        "asset2": {
          "type": "TickerAsset"
        },
        "balance": {
          "type": "u64"
        },
        "heartbeat": {
          "type": "u32"
        },
        "last_charge": {
          "type": "u64"
        },
        "owner": {
          "type": "Address"
        },
        "status": {
          "type": "SubscriptionStatus"
        },
        "threshold": {
          "type": "u32"
        },
        "webhook": {
          "type": "Bytes"
        }
      }
    },
    "ConfigData": {
      "fields": {
        "admin": {
          "type": "Address"
        },
        "fee": {
          "type": "u64"
        },
        "token": {
          "type": "Address"
        }
      }
    },
    "CreateSubscription": {
      "fields": {
        "asset1": {
          "type": "TickerAsset"
        },
        "asset2": {
          "type": "TickerAsset"
        },
        "heartbeat": {
          "type": "u32"
        },
        "owner": {
          "type": "Address"
        },
        "threshold": {
          "type": "u32"
        },
        "webhook": {
          "type": "Bytes"
        }
      }
    }
  },
  "errors": {
    "AlreadyInitialized": {
      "value": 0
    },
    "Unauthorized": {
      "value": 1
    },
    "SubscriptionNotFound": {
      "value": 2
    },
    "NotInitialized": {
      "value": 3
    },
    "InvalidAmount": {
      "value": 4
    },
    "InvalidHeartbeat": {
      "value": 5
    },
    "InvalidThreshold": {
      "value": 6
    },
    "WebhookTooLong": {
      "value": 7
    },
    "InvalidSubscriptionStatusError": {
      "value": 8
    }
  },
  "enums": {
    "SubscriptionStatus": {
      "cases": {
        "Active": {
          "value": 0
        },
        "Suspended": {
          "value": 1
        },
        "Cancelled": {
          "value": 2
        }
      }
    }
  },
  "functions": {
    "config": {
      "inputs": [
        {
          "name": "config",
          "type": "ConfigData"
        }
      ],
      "outputs": []
    },
    "set_fee": {
      "inputs": [
        {
          "name": "fee",
          "type": "u64"
        }
      ],
      "outputs": []
    },
    "trigger": {
      "inputs": [
        {
          "name": "timestamp",
          "type": "u64"
        },
        {
          "name": "trigger_hash",
          "type": "BytesN<32>"
        }
      ],
      "outputs": []
    },
    "update_contract": {
      "inputs": [
        {
          "name": "wasm_hash",
          "type": "BytesN<32>"
        }
      ],
      "outputs": []
    },
    "charge": {
      "inputs": [
        {
          "name": "subscription_ids",
          "type": "Vec<u64>"
        }
      ],
      "outputs": []
    },
    "create_subscription": {
      "inputs": [
        {
          "name": "new_subscription",
          "type": "CreateSubscription"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ],
      "outputs": [
        "(u64, Subscription)"
      ]
    },
    "deposit": {
      "inputs": [
        {
          "name": "from",
          "type": "Address"
        },
        {
          "name": "subscription_id",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ],
      "outputs": []
    },
    "cancel": {
      "inputs": [
        {
          "name": "subscription_id",
          "type": "u64"
        }
      ],
      "outputs": []
    },
    "get_subscription": {
      "inputs": [
        {
          "name": "subscription_id",
          "type": "u64"
        }
      ],
      "outputs": [
        "Subscription"
      ]
    },
    "admin": {
      "inputs": [],
      "outputs": [
        "Option<Address>"
      ]
    },
    "version": {
      "inputs": [],
      "outputs": [
        "u32"
      ]
    },
    "fee": {
      "inputs": [],
      "outputs": [
        "u64"
      ]
    },
    "token": {
      "inputs": [],
      "outputs": [
        "Address"
      ]
    }
  },
  "interfaceVersion": "20.0",
  "rustVersion": "1.74.0",
  "sdkVersion": "20.5.0#9e2c3022b4355b224a7a814e13ba51761eeb14bb"
}
```

Contracts compiled with newer SDK versions may contain additional metadata. Rust doc comments are exposed as `doc`
properties on functions, function inputs, structs, struct fields, enums, unions, errors, and their cases. Contract
events declared with `#[contractevent]` are parsed into a separate `events` section:

```json
{
  "events": {
    "ZapInitializedEvent": {
      "prefixTopics": [
        "zap_initialized"
      ],
      "params": [
        {
          "name": "factory",
          "type": "Address",
          "location": "data"
        },
        {
          "name": "position_manager",
          "type": "Address",
          "location": "data"
        }
      ],
      "dataFormat": "Map",
      "doc": "Zap router initialization event"
    }
  }
}
```
