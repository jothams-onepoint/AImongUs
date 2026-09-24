// Scoring rules: "the AI" always means the human player assigned to be the AI
// impostor that round -- there is no separate AI entity, only players.
function computeRoundScores(round, allPlayerIds) {
  const voteCounts = {};
  for (const targetId of round.votes.values()) {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
  }

  const maxVotes = Math.max(0, ...Object.values(voteCounts));
  const accusedSet = maxVotes > 0
    ? Object.keys(voteCounts).filter((pid) => voteCounts[pid] === maxVotes)
    : [];

  const pointsAwarded = Object.fromEntries(allPlayerIds.map((id) => [id, 0]));
  const aiCaught = accusedSet.includes(round.aiPlayerId);

  if (aiCaught) {
    for (const [voterId, targetId] of round.votes.entries()) {
      if (targetId === round.aiPlayerId) {
        pointsAwarded[voterId] = (pointsAwarded[voterId] || 0) + 1;
      }
    }
    for (const pid of accusedSet) {
      if (pid !== round.aiPlayerId) {
        pointsAwarded[pid] = (pointsAwarded[pid] || 0) + 1;
      }
    }
  } else {
    pointsAwarded[round.aiPlayerId] = (pointsAwarded[round.aiPlayerId] || 0) + 1;
    for (const pid of accusedSet) {
      pointsAwarded[pid] = (pointsAwarded[pid] || 0) + 1;
    }
  }

  return { voteCounts, accusedSet, aiCaught, pointsAwarded };
}

module.exports = { computeRoundScores };
