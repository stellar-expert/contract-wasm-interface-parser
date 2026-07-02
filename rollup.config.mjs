import terser from '@rollup/plugin-terser'

export default {
    input: 'src/bundle.js',
    output: {
        file: 'lib/wasmparser.js',
        format: 'umd',
        name: 'sorobanwasmparser',
        exports: 'default',
        sourcemap: true,
        globals: {
            '@stellar/stellar-sdk': '@stellar/stellar-sdk'
        }
    },
    external: ['@stellar/stellar-sdk'],
    plugins: [
        terser(),
        {
            name: 'replace-env',
            transform(code, id) {
                if (code.includes('process.env.NODE_ENV')) {
                    return {
                        code: code.replace(/process\.env\.NODE_ENV/g, JSON.stringify('production')),
                        map: null
                    }
                }
                return null
            }
        }]
}
