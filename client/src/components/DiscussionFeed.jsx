import React, { useState } from 'react';
import { useGame } from '../hooks/useCurrentPlayer.js';

export default function DiscussionFeed() {
  const { room, sendDiscussionMessage } = useGame();
  const [draft, setDraft] = useState('');
  const round = room?.round;
  if (!round) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const res = await sendDiscussionMessage(draft.trim());
    if (res.ok) setDraft('');
  };

  return (
    <div className="discussion-feed">
      <h3>Discussion</h3>
      <ul className="feed chat">
        {round.discussionMessages.map((m) => (
          <li key={m.id}>
            <span className="name">{m.name}:</span> {m.text}
          </li>
        ))}
      </ul>
      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Say something…"
          maxLength={500}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
