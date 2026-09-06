export function parseContractMeta(meta) {
    const res = {}
    for (const {value} of meta) {
        const key = value.key.toString()
        const val = value.val.toString()
        switch (key) {
            case 'rsver':
                res.rustVersion = val
                break
            case 'rssdkver':
                res.sdkVersion = val
                break
            default:
                res[key] = val
                break
        }
    }
    return res
}

export function parseSpec(entries) {
    return new SpecParser().parse(entries)
}


class SpecParser {
    constructor() {
        this.res = {}
    }

    /**
     * @type {{}}
     */
    res

    addSpec(key, attr, parser) {
        //this.parseFunction(attr), attr.doc
        let spec = this.res[key]
        if (spec === undefined) {
            spec = this.res[key] = {}
        }
        parser.call(this, attr, spec)
    }

    parse(entries) {
        for (const spec of entries) {
            const {value} = spec
            switch (spec.type) {
                case 'scSpecEntryFunctionV0':
                    this.addSpec('functions', value, this.parseFunction)
                    break
                case 'scSpecEntryUdtStructV0':
                    this.addSpec('structs', value, this.parseStruct)
                    break
                case 'scSpecEntryUdtUnionV0':
                    this.addSpec('unions', value, this.parseUnion)
                    break
                case 'scSpecEntryUdtEnumV0':
                    this.addSpec('enums', value, this.parseEnum)
                    break
                case 'scSpecEntryUdtErrorEnumV0':
                    this.addSpec('errors', value, this.parseError)
                    break
                case 'scSpecEntryEventV0':
                    this.addSpec('events', value, this.parseEvent)
                    break
                default:
                    console.log('Unknown spec type: ' + spec.type)
                    break
            }
        }
        return this.res
    }

    parseFunction(attr, into) {
        into[attr.name.toString()] = this.withDocs({
            inputs: attr.inputs.map(a => this.parseFuncArgument(a)),
            outputs: attr.outputs.map(o => this.parseParameterType(o))
        }, attr)
    }

    parseStruct(attr, into) {
        const fields = {}
        for (const f of attr.fields) {
            this.parseParameter(f, fields)
        }
        into[this.parseStructName(attr)] = this.withDocs({fields}, attr)
    }

    parseUnion(attr, into) {
        const cases = {}
        for (const {value} of attr.cases) {
            cases[value.name.toString()] = value.type ?
                value.type.map(t => this.parseParameterType(t)) :
                []
        }
        into[this.parseStructName(attr)] = this.withDocs({cases}, attr)
    }

    parseEnum(attr, into) {
        const cases = {}
        for (const c of attr.cases) {
            const value = c.value
            if (value.name) {
                cases[value.name.toString()] = value.value
            } else {
                cases[c.name.toString()] = this.withDocs({value}, c)
            }
        }
        into[this.parseStructName(attr)] = this.withDocs({cases}, attr)
    }

    parseError(attr, into) {
        for (const c of attr.cases) {
            into[c.name.toString()] = this.withDocs({value: c.value}, c)
        }
    }

    parseEvent(attr, into) {
        let dataFormat
        switch (attr.dataFormat.value) {
            case 0:
                dataFormat = 'SingleValue'
                break
            case 1:
                dataFormat = 'Vec'
                break
            case 2:
                dataFormat = 'Map'
                break
            default:
                dataFormat = attr.dataFormat.name
                break
        }
        const evt = {
            prefixTopics: attr.prefixTopics.map(t => t.toString()),
            params: attr.params.map(p => {
                const param = {
                    name: p.name.toString(),
                    type: this.parseParameterType(p.type),
                    location: p.location.value === 0 ? 'data' : 'topics'
                }
                return this.withDocs(param, p)
            }),
            dataFormat
        }
        into[this.parseStructName(attr)] = this.withDocs(evt, attr)
    }

    parseParameterType(type) {
        const typeName = type.type
        switch (typeName) {
            case 'scSpecTypeOption':
                return `Option<${this.parseParameterType(type.value.valueType)}>`
            case 'scSpecTypeBytesN':
                return `BytesN<${type.value.n}>`
            case 'scSpecTypeVec':
                return `Vec<${this.parseParameterType(type.value.elementType)}>`
            case 'scSpecTypeMap':
                return `Map<${this.parseParameterType(type.value.keyType)}, ${this.parseParameterType(type.value.valueType)}>`
            case 'scSpecTypeResult':
                return `Result<${this.parseParameterType(type.value.okType)}, ${this.parseParameterType(type.value.errorType)}>`
            case 'scSpecTypeTuple':
                return `(${type.value.valueTypes.map(v => this.parseParameterType(v)).join(', ')})`
            case 'scSpecTypeUdt':
                return type.value.name.toString()
            default:
                let res = typeName.replace('scSpecType', '')
                if (/^[IU](8|16|32|64|128)$/.test(res) || res === 'Bool') { //remap standard int types
                    res = res.toLowerCase()
                }
                return res
        }
    }

    parseStructName(value) {
        let structName = value.name.toString()
        if (value.lib.length) {
            structName += ':' + value.lib.toString()
        }
        return structName
    }

    parseParameter(param, into) {
        into[param.name.toString()] = this.withDocs({type: this.parseParameterType(param.type)}, param)
    }

    parseFuncArgument(arg) {
        return this.withDocs({
            name: arg.name.toString(),
            type: this.parseParameterType(arg.type)
        }, arg)
    }

    withDocs(descriptor, attr) {
        if (attr.doc?.length) {
            descriptor.doc = attr.doc.toString()
        }
        return descriptor
    }
}

