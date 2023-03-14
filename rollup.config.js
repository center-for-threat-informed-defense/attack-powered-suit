import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-only';
import copy from 'rollup-plugin-copy';

const production = !process.env.ROLLUP_WATCH;

function serve() {
    let server;

    function toExit() {
        if (server) server.kill(0);
    }

    return {
        writeBundle() {
            if (server) return;
            server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
                stdio: ['ignore', 'inherit', 'inherit'],
                shell: true
            });

            process.on('SIGTERM', toExit);
            process.on('exit', toExit);
        }
    };
}

export default [{
    input: 'src/main.js',
    output: {
        sourcemap: true,
        format: 'iife',
        exports: 'auto',
        name: 'app',
        file: 'public/build/bundle.js'
    },
    plugins: [
        svelte({
            compilerOptions: {
                // enable run-time checks when not in production
                dev: !production
            }
        }),
        // we'll extract any component CSS out into
        // a separate file - better for performance
        css({ output: 'bundle.css' }),

        copy({
            targets: [
                {
                    src: "node_modules/bootstrap/dist/css/bootstrap.min.*",
                    dest: "public/build/"
                }, {
                    src: "node_modules/bootstrap-icons/font/bootstrap-icons.*",
                    dest: "public/build/"
                }, {
                    src: "node_modules/bootstrap-icons/font/fonts/",
                    dest: "public/build/"
                }, {
                    src: "data/attack.json",
                    dest: "public/build/"
                }, {
                    src: "data/lunr-index.jsonx",
                    dest: "public/build/"
                }
            ],
        }),

        // If you have external dependencies installed from
        // npm, you'll most likely need these plugins. In
        // some cases you'll need additional configuration -
        // consult the documentation for details:
        // https://github.com/rollup/plugins/tree/master/packages/commonjs
        resolve({
            browser: true,
            dedupe: ['svelte']
        }),
        commonjs({
            defaultIsModuleExports: true
        }),

        // In dev mode, call `npm run start` once
        // the bundle has been generated
        !production && serve(),

        // Watch the `public` directory and refresh the
        // browser on changes when not in production
        !production && livereload('public'),

        // If we're building for production (npm run build
        // instead of npm run dev), minify
        production && terser()
    ],
    watch: {
        clearScreen: true
    }
}, {
    input: 'src/worker.js',
    output: {
        sourcemap: true,
        format: 'iife',
        exports: 'auto',
        name: 'worker',
        file: 'public/build/worker.js',
    },
    plugins: [
        resolve({
            browser: true,
            dedupe: ['svelte']
        }),
        commonjs({
            defaultIsModuleExports: true
        })
    ],
},
{
    input: 'src/content.js',
    output: {
        sourcemap: true,
        format: 'iife',
        exports: 'auto',
        name: 'worker',
        file: 'public/build/content.js',
    },
    plugins: [
        resolve({
            browser: true,
            dedupe: ['svelte']
        }),
    ],
}];
