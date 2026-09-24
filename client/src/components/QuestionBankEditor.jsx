import React, { useState } from 'react';
import { useGame } from '../hooks/useCurrentPlayer.js';

export default function QuestionBankEditor() {
  const { room, addQuestion, removeQuestion, moveQuestion } = useGame();
  const [draft, setDraft] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const res = await addQuestion(draft.trim());
    if (res.ok) setDraft('');
  };

  const questions = room.questionBank;

  return (
    <div className="question-bank-editor">
      <h4>Question bank</h4>
      <p className="hint">Questions are asked in this order. Only you can see this list.</p>
      <ul>
        {questions.map((q, i) => (
          <li key={q.id} className={q.used ? 'used' : ''}>
            <span className="order-index">{i + 1}</span>
            <span className="question-text">{q.text}</span>
            <span className="question-actions">
              <button
                type="button"
                className="link"
                disabled={i === 0}
                onClick={() => moveQuestion(q.id, 'up')}
              >
                ↑
              </button>
              <button
                type="button"
                className="link"
                disabled={i === questions.length - 1}
                onClick={() => moveQuestion(q.id, 'down')}
              >
                ↓
              </button>
              <button type="button" className="link danger" onClick={() => removeQuestion(q.id)}>
                remove
              </button>
            </span>
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
