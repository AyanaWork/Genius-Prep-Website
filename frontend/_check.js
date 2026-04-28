const parser = require('@babel/parser');
const fs = require('fs');
let fails = 0;
for (const f of process.argv.slice(2)) {
  try {
    parser.parse(fs.readFileSync(f, 'utf8'), { sourceType: 'module', plugins: ['jsx'] });
    console.log('OK', f);
  } catch (e) {
    console.log('FAIL', f, '-', e.message);
    fails++;
  }
}
process.exit(fails ? 1 : 0);
