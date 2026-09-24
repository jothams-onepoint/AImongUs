import React, { useEffect, useState } from 'react';
import { useGame } from '../hooks/useCurrentPlayer.js';
import { copyText } from '../utils/clipboard.js';

export default function AnswerFeed() {
  const { room, myPlayerId, submitAnswer } = useGame();
  const [draft, setDraft] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const round = room?.round;
  const isWriting = room?.phase === 'writing';
  const isAnswerer = round?.isAnswerer;
  const isAiPlayer = round?.aiPlayerId === myPlayerId;

  useEffect(() => {
    setDraft('');
    setSubmitted(false);
    setCopied(false);
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

  const handleCopyQuestion = async () => {
    const ok = await copyText(round.questionText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="answer-feed">
      <h3>Answers</h3>
      {!isAnswerer && (
        <div className="spectator-instructions">
          <p>
            You're not answering this round — watch the answers carefully, you'll need to help
            identify the AI when voting.
          </p>
        </div>
      )}
      {isAnswerer && isWriting && (
        <>
          {isAiPlayer && (
            <div className="ai-instructions">
              <p><strong>You're the AI this round!</strong> Copy the question, paste it into your AI chatbot of choice, then paste its reply into the box below.</p>
              <button type="button" className="secondary" onClick={handleCopyQuestion}>
                {copied ? 'Copied!' : 'Copy question'}
              </button>
            </div>
          )}
          <form className="answer-form" onSubmit={handleSubmit}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={isAiPlayer ? "Paste AI's answer here" : 'Type your answer...'}
              maxLength={500}
            />
            <button type="submit">{submitted ? 'Update answer' : 'Submit answer'}</button>
            {submitted && <span className="hint">Submitted — you can still edit until time's up.</span>}
          </form>
        </>
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
