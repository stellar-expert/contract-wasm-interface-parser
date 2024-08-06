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
  "enums": {
    "SubscriptionStatus": {
      "Active": {
        "value": 0
      },
      "Cancelled": {
        "value": 2
      },
      "Suspended": {
        "value": 1
      }
    }
  },
  "errors": {
    "AlreadyInitialized": {
      "value": 0
    },
    "InvalidAmount": {
      "value": 4
    },
    "InvalidHeartbeat": {
      "value": 5
    },
    "InvalidSubscriptionStatusError": {
      "value": 8
    },
    "InvalidThreshold": {
      "value": 6
    },
    "NotInitialized": {
      "value": 3
    },
    "SubscriptionNotFound": {
      "value": 2
    },
    "Unauthorized": {
      "value": 1
    },
    "WebhookTooLong": {
      "value": 7
    }
  },
  "functions": {
    "admin": {
      "inputs": {},
      "outputs": [
        "option<address>"
      ]
    },
    "cancel": {
      "inputs": {
        "subscription_id": {
          "type": "u64"
        }
      },
      "outputs": []
    },
    "charge": {
      "inputs": {
        "subscription_ids": {
          "type": "vec<u64>"
        }
      },
      "outputs": []
    },
    "config": {
      "inputs": {
        "config": {
          "type": "ConfigData"
        }
      },
      "outputs": []
    },
    "create_subscription": {
      "inputs": {
        "amount": {
          "type": "u64"
        },
        "new_subscription": {
          "type": "CreateSubscription"
        }
      },
      "outputs": [
        "tuple<u64,Subscription>"
      ]
    },
    "deposit": {
      "inputs": {
        "amount": {
          "type": "u64"
        },
        "from": {
          "type": "address"
        },
        "subscription_id": {
          "type": "u64"
        }
      },
      "outputs": []
    },
    "fee": {
      "inputs": {},
      "outputs": [
        "u64"
      ]
    },
    "get_subscription": {
      "inputs": {
        "subscription_id": {
          "type": "u64"
        }
      },
      "outputs": [
        "Subscription"
      ]
    },
    "set_fee": {
      "inputs": {
        "fee": {
          "type": "u64"
        }
      },
      "outputs": []
    },
    "token": {
      "inputs": {},
      "outputs": [
        "address"
      ]
    },
    "trigger": {
      "inputs": {
        "timestamp": {
          "type": "u64"
        },
        "trigger_hash": {
          "type": "bytesn<32>"
        }
      },
      "outputs": []
    },
    "update_contract": {
      "inputs": {
        "wasm_hash": {
          "type": "bytesn<32>"
        }
      },
      "outputs": []
    },
    "version": {
      "inputs": {},
      "outputs": [
        "u32"
      ]
    }
  },
  "structs": {
    "ConfigData": {
      "admin": {
        "type": "address"
      },
      "fee": {
        "type": "u64"
      },
      "token": {
        "type": "address"
      }
    },
    "CreateSubscription": {
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
        "type": "address"
      },
      "threshold": {
        "type": "u32"
      },
      "webhook": {
        "type": "bytes"
      }
    },
    "Subscription": {
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
        "type": "address"
      },
      "status": {
        "type": "SubscriptionStatus"
      },
      "threshold": {
        "type": "u32"
      },
      "webhook": {
        "type": "bytes"
      }
    },
    "TickerAsset": {
      "asset": {
        "type": "Asset"
      },
      "source": {
        "type": "string"
      }
    }
  },
  "unions": {
    "Asset": {
      "Other": [
        "symbol"
      ],
      "Stellar": [
        "address"
      ]
    }
  },
  "interfaceVersion": "85899345920",
  "rustVersion": "1.74.0",
  "sdkVersion": "20.5.0#9e2c3022b4355b224a7a814e13ba51761eeb14bb"
}
```