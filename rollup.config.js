import fs from 'fs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';

const info = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }));
let licenseHeader = fs.readFileSync('license-header.txt', { encoding: 'utf8' });
licenseHeader = licenseHeader.replace('{{version}}', info.version);
licenseHeader = licenseHeader.replace('{{year}}', new Date().getFullYear());

export default {
    input: 'src/element-behaviors.js',
    plugins: [
        json(),
        // Prepend our license header to the top of the output files.
        {
            name: 'prepend-license',
            generateBundle(options, bundle) {
                for (const chunk of Object.values(bundle)) {
                    if (chunk.type === 'chunk') {
                        chunk.code = `${licenseHeader}\n${chunk.code}`;
                    }
                }
            }
        }
    ],
    output: [
        // Compile uncompressed library; retains comments.
        {
            file: 'dist/eb.js',
            format: 'iife'
        },
        // Compile and minified library (no comments) best for production.
        {
            file: 'dist/eb.min.js',
            format: 'iife',
            plugins: [
                terser()
            ]
        }
    ]
};
