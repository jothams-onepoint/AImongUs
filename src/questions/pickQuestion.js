// Picks a random unused question from the bank. If every question has been
// used this session, resets the used flags and cycles back through them.
function pickRandomQuestion(questionBank) {
  let unused = questionBank.filter((q) => !q.used);
  if (unused.length === 0) {
    questionBank.forEach((q) => { q.used = false; });
    unused = questionBank;
  }
  const question = unused[Math.floor(Math.random() * unused.length)];
  question.used = true;
  return question;
}

module.exports = { pickRandomQuestion };
