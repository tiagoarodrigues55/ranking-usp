import { getAllPlayers, updatePlayerName } from '../../lib/supabaseClient';
import type { Player } from '../../types';
import EditPlayerClient from './EditPlayerClient'; // Client component for interactivity

export default async function EditPlayerPage() {
  const players = await getAllPlayers();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-8">Editar Nomes de Jogadores</h1>
      <EditPlayerClient initialPlayers={players} />
    </main>
  );
}