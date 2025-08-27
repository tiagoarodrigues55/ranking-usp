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
    <main className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="w-full max-w-xl">
        <div className="flex justify-start mb-8">
          <Link href="/" className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
            &larr; Voltar para a votação
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-center">Adicionar Nova Pergunta</h1>

        <form onSubmit={handleSubmit} className="w-full bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <label htmlFor="question" className="block text-lg font-medium text-gray-300 mb-2">
              Texto da Pergunta
            </label>
            <input
              id="question"
              type="text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder='Ex: Quem conta as melhores piadas?'
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 bg-green-600 rounded-md hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Adicionando...' : 'Adicionar Pergunta'}
          </button>
        </form>

        {feedback && (
          <div 
            className={`mt-6 p-4 rounded-md text-center font-medium ${
              feedback.type === 'success' ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'
            }`}
          >
            {feedback.message}
          </div>
        )}
      </div>
    </main>
  );
}
