'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image'; // Import Image component
import Link from 'next/link'; // Import Link component
import type { Player } from '../../types';
import { updatePlayerName } from '../../lib/supabaseClient';

interface EditPlayerClientProps {
  initialPlayers: Player[];
}

export default function EditPlayerClient({ initialPlayers }: EditPlayerClientProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null); // Define the ref

  const handleEditClick = (player: Player) => {
    setEditingPlayerId(player.id);
    setNewPlayerName(player.name);
    setMessage(null);
  };

  const handleSaveClick = async (playerId: number) => {
    if (newPlayerName.trim() === '') {
      setMessage({ type: 'error', text: 'O nome não pode ser vazio.' });
      return;
    }

    setMessage(null);
    const { success, error } = await updatePlayerName(playerId, newPlayerName.trim());

    if (success) {
      setPlayers(players.map(p => p.id === playerId ? { ...p, name: newPlayerName.trim() } : p));
      setEditingPlayerId(null);
      setNewPlayerName('');
      setMessage({ type: 'success', text: 'Nome atualizado com sucesso!' });
    } else {
      setMessage({ type: 'error', text: `Erro ao atualizar nome: ${error}` });
    }
  };

  const handleCancelClick = () => {
    setEditingPlayerId(null);
    setNewPlayerName('');
    setMessage(null);
  };

  useEffect(() => {
    if (editingPlayerId !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingPlayerId]);

  return (
    <>
      <div className="back-link-container"> {/* Re-using back-link-container from add-question page */}
        <Link href="/" className="button bg-blue-500 text-white hover:bg-blue-600">
          &larr; Voltar para a votação
        </Link>
      </div>
      <div className="edit-player-container">
      {message && (
        <div className={`message-box ${message.type}`}>
          {message.text}
        </div>
      )}
      <ul className="player-list">
        {players.map((player) => (
          <li key={player.id} className="player-list-item">
            {editingPlayerId === player.id ? (
              <div className="edit-form-container">
                <input
                  ref={inputRef} // Attach the ref
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="edit-input"
                />
                <div className="button-group">
                  <button
                    onClick={() => handleSaveClick(player.id)}
                    className="button bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={handleCancelClick}
                    className="button bg-gray-300 text-white hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="player-image-display">
                  {player.image_url ? (
                    <Image
                      src={player.image_url}
                      alt={player.name}
                      width={96} // Corresponds to w-24
                      height={96} // Corresponds to h-24
                      unoptimized
                      className="player-image-actual"
                    />
                  ) : (
                    <span className="player-icon-placeholder-large">👤</span> // Placeholder icon
                  )}
                </div>
                <span className="player-name-display">{player.name}</span>
                <button
                  onClick={() => handleEditClick(player)}
                  className="button bg-yellow-500 text-white hover:bg-yellow-600"
                >
                  Editar
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
    </> // Added closing fragment tag
  );
}
