const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I/O, avoids visual confusion
const CODE_LENGTH = 4;

function generateCode() {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

function generateUniqueRoomCode(existingCodes) {
  let code = generateCode();
  while (existingCodes.has(code)) {
    code = generateCode();
  }
  return code;
}

module.exports = { generateUniqueRoomCode };
