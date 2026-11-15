import {build} from 'esbuild';
import {copyFile,mkdir,readdir} from 'node:fs/promises';
await mkdir('dist/neural/tfjs',{recursive:true});
await build({entryPoints:['src/neural/engine/katago/worker.ts'],outfile:'dist/neural/worker.js',bundle:true,minify:true,format:'esm',platform:'browser',target:['es2022'],legalComments:'linked',logLevel:'info'});
const root='node_modules/@tensorflow/tfjs-backend-wasm/dist';
for(const file of await readdir(root)) if(file.endsWith('.wasm')) await copyFile(root+'/'+file,'dist/neural/tfjs/'+file);
