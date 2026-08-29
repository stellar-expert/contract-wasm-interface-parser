module.exports = {
    //stellar-sdk's CJS build requires ESM-only packages, which jest's CJS runtime cannot load as-is
    transformIgnorePatterns: ['node_modules/(?!.*(@noble|@exodus))']
}
