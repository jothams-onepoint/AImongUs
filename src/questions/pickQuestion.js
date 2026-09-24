// Picks the next unused question in the bank's display order. Once every
// question has been used this session, resets the used flags and starts
// back at the top of the list.
function pickNextQuestion(questionBank) {
  if (questionBank.length === 0) return null;
  let next = questionBank.find((q) => !q.used);
  if (!next) {
    questionBank.forEach((q) => { q.used = false; });
    next = questionBank[0];
  }
  next.used = true;
  return next;
}

module.exports = { pickNextQuestion };
