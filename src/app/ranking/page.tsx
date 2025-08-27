'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import type { Question } from '../../types';

// Interface para o jogador com seu rating específico para uma pergunta
interface RankedPlayer {
  id: number;
  name: string;
  rating: number;
}

export default function RankingPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [rankedPlayers, setRankedPlayers] = useState<RankedPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Efeito para buscar as perguntas disponíveis
  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase.from('questions').select('*');
      if (error) {
        setError('Erro ao buscar perguntas.');
        console.error(error);
      } else if (data && data.length > 0) {
        setQuestions(data);
        setSelectedQuestionId(data[0].id); // Seleciona a primeira pergunta por padrão
      } else {
        setError('Nenhuma pergunta encontrada. Adicione uma na página de votação.');
      }
    };
    fetchQuestions();
  }, []);

  // Efeito para buscar o ranking quando uma pergunta é selecionada
  useEffect(() => {
    if (!selectedQuestionId) return;

    const fetchRanking = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('ratings')
        .select('rating, players(id, name)') // Faz o join com a tabela players
        .eq('question_id', selectedQuestionId)
        .order('rating', { ascending: false });

      if (error) {
        setError('Erro ao buscar o ranking.');
        console.error(error);
        setRankedPlayers([]);
      } else {
        // Mapeia os dados para a interface RankedPlayer
        const players = data.map((item: any) => ({
          id: item.players.id,
          name: item.players.name,
          rating: item.rating,
        }));
        setRankedPlayers(players);
      }
      setIsLoading(false);
    };

    fetchRanking();
  }, [selectedQuestionId]);

  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <h1 className="text-4xl font-bold mb-8">Ranking</h1>
      <Link href="/" className="mt-8 px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
        Voltar para a votação
      </Link>
      {/* Seletor de Perguntas */}
      <div className="w-full max-w-2xl mb-6">
        <label htmlFor="question-select" className="block text-lg font-medium text-gray-300 mb-2">
          Selecione a pergunta para ver o ranking:
        </label>
        <select
          id="question-select"
          value={selectedQuestionId || ''}
          onChange={(e) => setSelectedQuestionId(Number(e.target.value))}
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={questions.length === 0}
        >
          {questions.map((q) => (
            <option key={q.id} value={q.id}>
              {q.text}
            </option>
          ))}
        </select>
      </div>

      {/* Tabela de Ranking */}
      <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">Carregando ranking...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : (
          <table className="w-full text-left">
            <thead className="border-b border-gray-600">
              <tr>
                <th className="p-4">Posição</th>
                <th className="p-4">Nome</th>
                <th className="p-4 text-right">Rating</th>
              </tr>
            </thead>
            <tbody>
              {rankedPlayers.map((player, index) => (
                <tr key={player.id} className="border-b border-gray-700 last:border-b-0">
                  <td className="p-4 font-bold">{index + 1}</td>
                  <td className="p-4">{player.name}</td>
                  <td className="p-4 text-right font-mono">{player.rating.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>


    </main>
  );
}