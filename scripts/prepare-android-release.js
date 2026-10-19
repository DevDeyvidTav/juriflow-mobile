const fs = require('fs');

const app = JSON.parse(fs.readFileSync('app.json', 'utf8'));
const parts = String(app.expo.version || '').split('.');
const numbers = [0, 1, 2].map((index) => Number(parts[index] || 0));

if (parts.length < 3 || numbers.some((value) => !Number.isInteger(value) || value < 0 || value > 99)) {
  console.error('A versão em app.json precisa ser x.y.z, com cada número de 0 a 99.');
  process.exit(1);
}

const [major, minor, patch] = numbers;
app.expo.android = app.expo.android || {};
app.expo.android.versionCode = major * 10000 + minor * 100 + patch;
fs.writeFileSync('app.json', JSON.stringify(app, null, 2) + '\n');
console.log(`versionCode ${app.expo.android.versionCode}`);
