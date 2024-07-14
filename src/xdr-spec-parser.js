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

    addSpec(key, descriptor, doc) {
        let spec = this.res[key]
        if (spec === undefined) {
            spec = this.res[key] = []
        }
        spec.push(this.withDocs(descriptor, doc))
    }

    parse(entries) {
        for (const spec of entries) {
            const value = spec.value()
            const {_attributes: attr} = value
            switch (spec._arm) {
                case 'functionV0':
                    this.addSpec('functions', this.parseFunction(attr), attr.doc)
                    break
                case 'udtStructV0':
                    this.addSpec('structs', this.parseStruct(attr), attr.doc)
                    break
                case 'udtUnionV0':
                    this.addSpec('unions', this.parseUnion(attr), attr.doc)
                    break
                case 'udtEnumV0':
                    this.addSpec('enums', this.parseEnum(attr), attr.doc)
                    break
                case 'udtErrorEnumV0':
                    this.addSpec('errors', this.parseError(attr), attr.doc)
                    break
                default:
                    console.log('Unknown spec type: ' + spec._arm)
                    break
            }
        }
        return this.res
    }

    parseFunction(attr) {
        return {
            name: attr.name.toString(),
            inputs: attr.inputs.map(i => this.parseParameter(i)),
            outputs: attr.outputs.map(o => this.parseParameterType(o))
        }
    }

    parseStruct(attr) {
        return {
            name: this.parseStructName(attr),
            fields: attr.fields.map(f => this.parseParameter(f))
        }
    }

    parseUnion(attr) {
        return {
            name: this.parseStructName(attr),
            cases: attr.cases.reduce((agg, c) => {
                const value = c.value()
                agg[value.name().toString()] = value.type ?
                    value.type().map(t => this.parseParameterType(t)) :
                    []
                return agg
            }, {})
        }
    }

    parseEnum(attr) {
        return {
            name: this.parseStructName(attr),
            cases: attr.cases.reduce((agg, c) => {
                const value = c.value()
                if (value.name) {
                    agg[value.name().toString()] = value.value()
                } else {
                    agg[c._attributes.name] = value
                }
                return agg
            }, {})
        }
    }

    parseError(attr) {
        return {
            name: this.parseStructName(attr),
            cases: attr.cases.map(c => ({
                name: c.name().toString(),
                value: c.value()
            }))
        }
    }

    parseParameterType(type) {
        const typeName = type.switch().name
        switch (typeName) {
            case 'scSpecTypeOption':
                return `option<${this.parseParameterType(type.value().valueType())}>`
            case 'scSpecTypeBytesN':
                return `bytesn<${type.value().n()}>`
            case 'scSpecTypeVec':
                return `vec<${this.parseParameterType(type.value().elementType())}>`
            case 'scSpecTypeMap':
                return `map<${this.parseParameterType(type.value().keyType())},${this.parseParameterType(type.value().valueType())}>`
            case 'scSpecTypeResult':
                return `result<${this.parseParameterType(type.value().okType())},${this.parseParameterType(type.value().errorType())}>`
            case 'scSpecTypeTuple':
                return `tuple<${type.value().valueTypes().map(this.parseParameterType).join()}>`
            case 'scSpecTypeUdt':
                return type.value().name().toString()
            default:
                return typeName.replace('scSpecType', '').toLowerCase()
        }
    }

    parseStructName(value) {
        let structName = value.name.toString()
        if (value.lib.length) {
            structName += ':' + value.lib.toString()
        }
        return structName
    }

    parseParameter(param) {
        const {_attributes: attr} = param
        const res = {
            name: attr.name.toString(),
            type: this.parseParameterType(attr.type)
        }
        return this.withDocs(res, attr.doc)
    }

    withDocs(descriptor, doc) {
        if (doc?.length) {
            descriptor.doc = doc.toString()
        }
        return descriptor
    }
}

