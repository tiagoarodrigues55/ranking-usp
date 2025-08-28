import { supabase } from "../lib/supabaseClient";
import VoteClientComponent from "./VoteClientComponent";
import type { Player, Question } from '../types';

// Tipos para os dados da rodada de votação
interface VotingRoundData {
  question: Question;
  players: [Player, Player];
}

async function getInitialRoundData(): Promise<VotingRoundData | null> {
  const { data, error } = await supabase.rpc('get_voting_round');

  if (error || !data || !data.question || !data.players || data.players.length < 2) {
    console.error("Falha ao buscar dados da rodada inicial:", error);
    // Retorna nulo se houver erro ou se os dados estiverem incompletos
    return null;
  }

  // Molda os dados para o tipo esperado
  return {
    question: data.question,
    players: data.players,
  };
}

export default async function HomePage() {
  const initialRoundData = await getInitialRoundData();

  if (!initialRoundData) {
    return (
      <main className="error-page-container">
        <h1 className="error-heading">Erro ao carregar a rodada de votação.</h1>
        <p>Não foi possível conectar ao banco de dados ou não há perguntas/jogadores suficientes.</p>
        <p className="error-text">Verifique as configurações do Supabase e se as tabelas `questions` e `players` estão populadas.</p>
      </main>
    );
  }

  return <VoteClientComponent initialRoundData={initialRoundData} />;
}
