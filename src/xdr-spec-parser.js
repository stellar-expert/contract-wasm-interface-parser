export function parseContractMeta(meta) {
    const res = {}
    for (const {_value} of meta) {
        const key = _value.key().toString()
        const val = _value.val().toString()
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
            const value = spec.value()
            const {_attributes: attr} = value
            switch (spec._arm) {
                case 'functionV0':
                    this.addSpec('functions', attr, this.parseFunction)
                    break
                case 'udtStructV0':
                    this.addSpec('structs', attr, this.parseStruct)
                    break
                case 'udtUnionV0':
                    this.addSpec('unions', attr, this.parseUnion)
                    break
                case 'udtEnumV0':
                    this.addSpec('enums', attr, this.parseEnum)
                    break
                case 'udtErrorEnumV0':
                    this.addSpec('errors', attr, this.parseError)
                    break
                case 'eventV0':
                    this.addSpec('events', attr, this.parseEvent)
                    break
                default:
                    console.log('Unknown spec type: ' + spec._arm)
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
        for (const c of attr.cases) {
            const value = c.value()
            cases[value.name().toString()] = value.type ?
                value.type().map(t => this.parseParameterType(t)) :
                []
        }
        into[this.parseStructName(attr)] = this.withDocs({cases}, attr)
    }

    parseEnum(attr, into) {
        const cases = {}
        for (const c of attr.cases) {
            const value = c.value()
            if (value.name) {
                cases[value.name().toString()] = value.value()
            } else {
                const attr = c._attributes
                cases[attr.name.toString()] = this.withDocs({value}, attr)
            }
        }
        into[this.parseStructName(attr)] = this.withDocs({cases}, attr)
    }

    parseError(attr, into) {
        for (const c of attr.cases) {
            const attr = c._attributes
            into[attr.name.toString()] = this.withDocs({value: attr.value}, attr)
        }
    }

    parseEvent(attr, into) {
        let dataFormat
        switch (attr.dataFormat.value) {
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
                const pa = p._attributes
                const param = {
                    name: pa.name.toString(),
                    type: this.parseParameterType(pa.type),
                    location: pa.location.value === 0 ? 'data' : 'topics'
                }
                return this.withDocs(param, pa)
            }),
            dataFormat
        }
        into[this.parseStructName(attr)] = this.withDocs(evt, attr)
    }

    parseParameterType(type) {
        const typeName = type.switch().name
        switch (typeName) {
            case 'scSpecTypeOption':
                return `Option<${this.parseParameterType(type.value().valueType())}>`
            case 'scSpecTypeBytesN':
                return `BytesN<${type.value().n()}>`
            case 'scSpecTypeVec':
                return `Vec<${this.parseParameterType(type.value().elementType())}>`
            case 'scSpecTypeMap':
                return `Map<${this.parseParameterType(type.value().keyType())}, ${this.parseParameterType(type.value().valueType())}>`
            case 'scSpecTypeResult':
                return `Result<${this.parseParameterType(type.value().okType())}, ${this.parseParameterType(type.value().errorType())}>`
            case 'scSpecTypeTuple':
                return `(${type.value().valueTypes().map(v => this.parseParameterType(v)).join(', ')})`
            case 'scSpecTypeUdt':
                return type.value().name().toString()
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
        const attr = param._attributes
        into[attr.name.toString()] = this.withDocs({type: this.parseParameterType(attr.type)}, attr)
    }

    parseFuncArgument(arg) {
        const attr = arg._attributes
        return this.withDocs({
            name: attr.name.toString(),
            type: this.parseParameterType(attr.type)
        }, attr)
    }

    withDocs(descriptor, attr) {
        if (attr.doc?.length) {
            descriptor.doc = attr.doc.toString()
        }
        return descriptor
    }
}

