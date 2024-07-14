module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                corejs: '3.34',
                useBuiltIns: 'entry',
                //modules: false,
                targets: {
                    browsers: [
                        '> 1%',
                        'not dead',
                        'not op_mini all'
                    ],
                    node: '18'
                }
            }
        ]
    ]
}