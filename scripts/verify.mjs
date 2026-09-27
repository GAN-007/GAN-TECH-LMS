import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { execFileSync } from 'node:child_process';

const files = ['index.html', 'GANTECH LEARNING SYS.html', 'assets/system-one.js'];
for (const file of files) await access(file, constants.R_OK);
execFileSync(process.execPath, ['--check', 'assets/system-one.js'], { stdio: 'inherit' });

const index = await readFile('index.html', 'utf8');
const legacy = await readFile('GANTECH LEARNING SYS.html', 'utf8');
const systemOne = await readFile('assets/system-one.js', 'utf8');

for (const [name, html] of [['index.html', index], ['GANTECH LEARNING SYS.html', legacy]]) {
  if (!html.includes('name="gan-lms-system-one-endpoint"')) throw new Error(name + ' is missing System-One endpoint metadata');
  if (!html.includes('assets/system-one.js')) throw new Error(name + ' is missing System-One client script');
}
if (!systemOne.includes('no_automatic_grading_or_certification')) throw new Error('High-stakes LMS safety boundary is missing');
if (!systemOne.includes('gan:lms-classify') || !systemOne.includes('gan:lms-system-one-decision')) {
  throw new Error('LMS System-One event integration is incomplete');
}

console.log('GAN-TECH LMS verification passed.');
