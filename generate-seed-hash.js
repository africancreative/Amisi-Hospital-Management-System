const crypto = require('crypto');

function hashPassword(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

const salt = 'amisi-seed-salt';
hashPassword('Amisi@2026!', salt).then(console.log);
