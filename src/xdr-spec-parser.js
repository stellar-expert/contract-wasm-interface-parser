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
    const res = {}

    function addSpec(key, descriptor) {
        let spec = res[key]
        if (spec === undefined) {
            spec = res[key] = []
        }
        spec.push(descriptor)
    }

    for (const spec of entries) {
        const value = spec.value()
        switch (spec._arm) {
            case 'functionV0':
                addSpec('functions', {
                    name: value.name().toString(),
                    inputs: value.inputs().map(parseParameter),
                    outputs: value.outputs().map(parseParameterType)
                })
                break
            case 'udtStructV0':
                addSpec('structs', {
                    name: parseStructName(value),
                    fields: value.fields().map(parseParameter)
                })
                break
            case 'udtUnionV0':
                addSpec('unions', {
                    name: parseStructName(value),
                    cases: value.cases().reduce((agg, c) => {
                        const value = c.value()
                        agg[value.name().toString()] = value.type ? parseParameterType(value.type()) : 'void'
                        return agg
                    }, {})
                })
                break
            case 'udtEnumV0':
                addSpec('enums', {
                    name: parseStructName(value),
                    cases: value.cases().reduce((agg, c) => {
                        const value = c.value()
                        agg[value.name().toString()] = value.value() //TODO: check
                        return agg
                    }, {})
                })
                break
            case 'udtErrorEnumV0':
                addSpec('errors', {
                    name: parseStructName(value),
                    cases: value.cases().map(c => ({
                        name: c.name().toString(),
                        value: c.value()
                    }))
                })
                break
        }
    }
    return res
}

function parseStructName(value) {
    let structName = value.name().toString()
    const lib = value.lib()
    if (lib.length) {
        structName += ':' + lib.toString()
    }
    return structName
}

function parseParameterType(type) {
    const typeName = type.switch().name
    switch (typeName) {
        case 'scSpecTypeOption':
            return `option<${parseParameterType(type.value().valueType())}>`
        case 'scSpecTypeBytesN':
            return `bytesn<${type.value().n()}>`
        case 'scSpecTypeVec':
            return `vec<${parseParameterType(type.value().elementType())}>`
        case 'scSpecTypeMap':
            return `map<${parseParameterType(type.value().keyType())},${parseParameter(type.value().valueType())}>`
        case 'scSpecTypeResult':
            return `result<${parseParameterType(type.value().okType())},${parseParameter(type.value().errorType())}>`
        case 'scSpecTypeTuple':
            return `tuple<${type.value().valueTypes().map(parseParameterType).join()}>`
        case 'scSpecTypeUdt':
            return `udt<${type.value().name()}>`
        default:
            return typeName.replace('scSpecType', '').toLowerCase()
    }
}

function parseParameter(param) {
    return {
        name: param.name().toString(),
        type: parseParameterType(param.type())
    }
}