import React, { useState } from 'react';
import { useGame } from '../hooks/useCurrentPlayer.js';

export default function QuestionBankEditor() {
  const { room, addQuestion, removeQuestion } = useGame();
  const [draft, setDraft] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const res = await addQuestion(draft.trim());
    if (res.ok) setDraft('');
  };

  return (
    <div className="question-bank-editor">
      <h4>Question bank</h4>
      <ul>
        {room.questionBank.map((q) => (
          <li key={q.id} className={q.used ? 'used' : ''}>
            <span>{q.text}</span>
            {q.isCustom && (
              <button type="button" className="link" onClick={() => removeQuestion(q.id)}>remove</button>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={handleAdd}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a custom question…"
          maxLength={500}
        />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}
