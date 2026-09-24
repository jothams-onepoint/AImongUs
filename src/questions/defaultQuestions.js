const { v4: uuidv4 } = require('uuid');

const DEFAULT_QUESTION_TEXTS = [
  'How are you? Answer in ten words or less. DO NOT ELABORATE, output only the answer.',
  'What is 2 + 2? Answer in ten words or less.',
  'Write a short story about a pumpkin named Jeff in 20 words or less. DO NOT ELABORATE, output only the answer.',
  'Write a haiku. (Three lines of 5,7 and 5 syllables. The first two lines appear unrelated, then are connected by the third line). DO NOT ELABORATE, output only the answer.',
  'What is your purpose? Answer in 20 words or less. DO NOT ELABORATE, output only the answer.',
  'What is the meaning of life? Answer in 10 words or less.',
  'Write a sentence pretending to be a human, in 20 words or less. DO NOT ELABORATE, output only the answer.',
];

function createDefaultQuestionBank() {
  return DEFAULT_QUESTION_TEXTS.map((text) => ({
    id: uuidv4(),
    text,
    isCustom: false,
    used: false,
  }));
}

module.exports = { createDefaultQuestionBank };
