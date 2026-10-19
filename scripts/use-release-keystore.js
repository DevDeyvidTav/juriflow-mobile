const fs = require('fs');

const file = 'android/app/build.gradle';
let text = fs.readFileSync(file, 'utf8');

if (!text.includes('signingConfig signingConfigs.debug')) {
  console.error('Não encontrei a assinatura de debug em android/app/build.gradle.');
  process.exit(1);
}

const releaseConfig = `
        release {
            storeFile file('release.keystore')
            storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
            keyAlias System.getenv("ANDROID_KEY_ALIAS")
            keyPassword System.getenv("ANDROID_KEY_PASSWORD")
        }`;

text = text.replace(/signingConfigs\s*\{/, (match) => match + releaseConfig);

const releaseAt = text.indexOf('release {', text.indexOf('buildTypes'));
const signingAt = text.indexOf('signingConfig signingConfigs.debug', releaseAt);
if (signingAt === -1) {
  console.error('Não encontrei signingConfig do build release.');
  process.exit(1);
}

const line = 'signingConfig signingConfigs.debug';
text = text.slice(0, signingAt) + 'signingConfig signingConfigs.release' + text.slice(signingAt + line.length);
fs.writeFileSync(file, text);
console.log('Release assinada com a chave própria.');
