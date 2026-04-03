const p = require('./package.json');
console.log('Dependencies:', Object.keys(p.dependencies).join(', '));
console.log('\nChecking requires...');
const files = require('fs').readdirSync('./services');
files.forEach(f => console.log('  services/' + f));
const routes = require('fs').readdirSync('./routes');
routes.forEach(f => console.log('  routes/' + f));
