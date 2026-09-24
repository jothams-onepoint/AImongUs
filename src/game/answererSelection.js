function shuffle(array) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Picks which connected players must write an answer this round. The AI-assigned
// player is always force-included, since the round can't function without them.
function selectAnswerers({ connectedPlayerIds, aiPlayerId, answerersPerRound }) {
  if (answerersPerRound === 'all') {
    return connectedPlayerIds.slice();
  }

  const count = Math.max(1, Math.min(Number(answerersPerRound), connectedPlayerIds.length));
  const others = connectedPlayerIds.filter((id) => id !== aiPlayerId);
  const shuffledOthers = shuffle(others);
  const fillCount = Math.max(0, count - 1);
  const chosen = shuffledOthers.slice(0, fillCount);

  return [aiPlayerId, ...chosen];
}

module.exports = { selectAnswerers };
