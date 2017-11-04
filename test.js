const fs = require('fs');
const path = require('path');

let filename = 'HomeKitTypes.js';
let srcBKP = path.join('../homebridge/node_modules/hap-nodejs/lib/gen/', filename);
let destDirBKP = '../homebridge/node_modules/hap-nodejs/lib/gen/';

let source = path.join('./lib/gen/', filename);
let destination = '../homebridge/node_modules/hap-nodejs/lib/gen/';




fs.access(destDirBKP, (err) => {
  if(err)
    fs.mkdirSync(destDirBKP);

  copyFile(srcBKP, path.join(destDirBKP,    (filename + '.bkp')));
});

function copyFile(src, dest) {

  let readStream = fs.createReadStream(src);

  readStream.once('error', (err) => {
    console.log(err);
  });

  readStream.once('end', () => {
    console.log('HomeKitTypes.js has a backup now!');

    let copyStream = fs.createReadStream(source);

    copyStream.once('error', (err) => {
    console.log(err);
      });
    copyStream.once('end', () => {
      console.log('HomeKitTypes.js replaced with custom file!');
    });

    copyStream.pipe(fs.createWriteStream(path.join(destination,    filename)));

  });

  readStream.pipe(fs.createWriteStream(dest));
}