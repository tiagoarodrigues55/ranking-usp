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

// Interface para os dados retornados pelo Supabase
interface RatingWithPlayer {
  rating: number;
  players: {
    id: number;
    name: string;
  };
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
        .order('rating', { ascending: false }) as { data: RatingWithPlayer[] | null, error: Error | null };

      if (error) {
        setError('Erro ao buscar o ranking.');
        console.error(error);
        setRankedPlayers([]);
      } else if (data) {
        // Mapeia os dados para a interface RankedPlayer
        const players = data
          .map((item) => {
            if (!item.players) {
              return null;
            }
            const playerInfo = item.players;
            return {
              id: playerInfo.id,
              name: playerInfo.name,
              rating: item.rating,
            };
          })
          .filter((player) => player !== null) as RankedPlayer[];

        setRankedPlayers(players);
      } else {
        setRankedPlayers([]);
      }
      setIsLoading(false);
    };

    fetchRanking();
  }, [selectedQuestionId]);

  return (
    <main className="ranking-page-container">
      <h1 className="ranking-heading">Ranking</h1>
      <Link href="/" className="button bg-blue-500 text-white hover:bg-blue-600">
        Voltar para a votação
      </Link>
      {/* Seletor de Perguntas */}
      <div className="question-selector-container">
        <label htmlFor="question-select" className="form-label">
          Selecione a pergunta para ver o ranking:
        </label>
        <select
          id="question-select"
          value={selectedQuestionId || ''}
          onChange={(e) => setSelectedQuestionId(Number(e.target.value))}
          className="form-select"
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
      <div className="ranking-table-container">
        {isLoading ? (
          <div className="ranking-loading-message">Carregando ranking...</div>
        ) : error ? (
          <div className="ranking-error-message">{error}</div>
        ) : (
          <table className="ranking-table">
            <thead className="ranking-table-head">
              <tr>
                <th className="ranking-table-header">Posição</th>
                <th className="ranking-table-header">Nome</th>
                <th className="ranking-table-header ranking-table-data rating">Rating</th>
              </tr>
            </thead>
            <tbody>
              {rankedPlayers.map((player, index) => (
                <tr key={player.id} className="ranking-table-row">
                  <td className="ranking-table-data position">{index + 1}</td>
                  <td className="ranking-table-data">{player.name}</td>
                  <td className="ranking-table-data rating">{player.rating.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}