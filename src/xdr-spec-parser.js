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
                default:
                    console.log('Unknown spec type: ' + spec._arm)
                    break
            }
        }
        return this.res
    }

    parseFunction(attr, into) {
        const inputs = {}
        attr.inputs.forEach(i => this.parseParameter(i, inputs))
        into[attr.name.toString()] = this.withDocs({
            inputs,
            outputs: attr.outputs.map(o => this.parseParameterType(o))
        }, attr.doc)
    }

    parseStruct(attr, into) {
        const fields = {}
        attr.fields.forEach(f => this.parseParameter(f, fields))
        into[this.parseStructName(attr)] = this.withDocs(fields, attr.doc)
    }

    parseUnion(attr, into) {
        const cases = {}
        attr.cases.forEach(c => {
            const value = c.value()
            cases[value.name().toString()] = value.type ?
                value.type().map(t => this.parseParameterType(t)) :
                []
        })
        into[this.parseStructName(attr)] = this.withDocs(cases, attr.doc)
    }

    parseEnum(attr, into) {
        const cases = {}
        attr.cases.forEach(c => {
            const value = c.value()
            if (value.name) {
                cases[value.name().toString()] = value.value()
            } else {
                cases[c._attributes.name.toString()] = this.withDocs({value}, c.doc())
            }
        })
        into[this.parseStructName(attr)] = this.withDocs(cases, attr.doc)
    }

    parseError(attr, into) {
        attr.cases.forEach(c => into[c.name().toString()] = this.withDocs({value: c.value()}, c.doc()))
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

    parseParameter(param, into) {
        const {_attributes: attr} = param
        into[attr.name.toString()] = this.withDocs({type: this.parseParameterType(attr.type)}, attr.doc)
    }

    withDocs(descriptor, doc) {
        if (doc?.length) {
            descriptor.doc = doc.toString()
        }
        return descriptor
    }
}

