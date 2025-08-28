'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

export default function AddQuestionPage() {
  const [questionText, setQuestionText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!questionText.trim()) {
      setFeedback({ type: 'error', message: 'A pergunta não pode estar em branco.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    const { error } = await supabase.rpc('add_new_question', { question_text: questionText });

    if (error) {
      setFeedback({ type: 'error', message: `Erro ao adicionar pergunta: ${error.message}` });
    } else {
      setFeedback({ type: 'success', message: 'Pergunta adicionada com sucesso!' });
      setQuestionText('');
    }

    setIsLoading(false);
  };

  return (
    <main className="add-question-page-container">
      <div className="add-question-content-wrapper">
        <div className="back-link-container">
          <Link href="/" className="button bg-blue-500 text-white hover:bg-blue-600">
            &larr; Voltar para a votação
          </Link>
        </div>

        <h1 className="add-question-heading">Adicionar Nova Pergunta</h1>

        <form onSubmit={handleSubmit} className="add-question-form">
          <div className="mb-6">
            <label htmlFor="question" className="form-label">
              Texto da Pergunta
            </label>
            <input
              id="question"
              type="text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="form-input"
              placeholder='Ex: Quem é mais calvo?'
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className={`button bg-green-500 text-white hover:bg-green-700 ${isLoading ? 'disabled' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Adicionando...' : 'Adicionar Pergunta'}
          </button>
        </form>

        {feedback && (
          <div
            className={`feedback-message ${feedback.type}`}
          >
            {feedback.message}
          </div>
        )}
      </div>
    </main>
  );
}
