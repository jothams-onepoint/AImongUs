import React, { useEffect, useState } from 'react';
import { useGame } from '../hooks/useCurrentPlayer.js';

export default function AnswerFeed() {
  const { room, myPlayerId, submitAnswer } = useGame();
  const [draft, setDraft] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const round = room?.round;
  const isWriting = room?.phase === 'writing';
  const isAnswerer = round?.isAnswerer;

  useEffect(() => {
    setDraft('');
    setSubmitted(false);
  }, [round?.index]);

  if (!round) return null;

  const playersById = Object.fromEntries(room.players.map((p) => [p.id, p]));
  const answersByPlayer = Object.fromEntries(round.answers.map((a) => [a.playerId, a]));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const res = await submitAnswer(draft.trim());
    if (res.ok) setSubmitted(true);
  };

  return (
    <div className="answer-feed">
      <h3>Answers</h3>
      {isAnswerer && isWriting && (
        <form className="answer-form" onSubmit={handleSubmit}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your answer..."
            maxLength={500}
          />
          <button type="submit">{submitted ? 'Update answer' : 'Submit answer'}</button>
          {submitted && <span className="hint">Submitted — you can still edit until time's up.</span>}
        </form>
      )}
      <ul className="feed">
        {round.answererIds.map((playerId) => {
          const player = playersById[playerId];
          const answer = answersByPlayer[playerId];
          return (
            <li key={playerId}>
              <span className="name">{player?.name || 'Unknown'}{playerId === myPlayerId ? ' (you)' : ''}</span>
              {answer ? (
                <p>{answer.text}</p>
              ) : (
                <p className="pending">{isWriting ? 'Still writing…' : 'No answer submitted.'}</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
