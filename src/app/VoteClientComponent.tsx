'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { calculateElo } from '../lib/elo';
import type { Player, Question } from '../types';

interface VotingRoundData {
  question: Question;
  players: [Player, Player];
}

interface VoteClientComponentProps {
  initialRoundData: VotingRoundData;
}

export default function VoteClientComponent({ initialRoundData }: VoteClientComponentProps) {
  const [question, setQuestion] = useState<Question>(initialRoundData.question);
  const [pair, setPair] = useState<[Player, Player]>(initialRoundData.players);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [screenHeight, setScreenHeight] = useState(0);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1000);
      setScreenHeight(window.innerHeight);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const getNewRound = async () => {
    const { data, error } = await supabase.rpc('get_voting_round');
    if (error || !data || !data.question || !data.players || data.players.length < 2) {
      console.error('Erro ao buscar nova rodada:', error);
      // Opcional: Adicionar feedback de erro para o usuário aqui
    } else {
      setQuestion(data.question);
      setPair(data.players);
    }
    setIsLoading(false);
  };

  const handleVote = async (winner: Player, loser: Player) => {
    if (isLoading) return;

    setIsLoading(true);

    const [newWinnerRating, newLoserRating] = calculateElo(winner.rating, loser.rating);

    await Promise.all([
      supabase
        .from('ratings')
        .update({ rating: newWinnerRating })
        .eq('player_id', winner.id)
        .eq('question_id', question.id),
      supabase
        .from('ratings')
        .update({ rating: newLoserRating })
        .eq('player_id', loser.id)
        .eq('question_id', question.id),
    ]);

    getNewRound();
  };

  const PlayerCard = ({ player, onVote }: {
    player: Player,
    onVote: () => void,
  }) => {
    const [imageError, setImageError] = useState(false);
    const cardHeight = isMobile ? screenHeight / 3 : 600;
    const cardWidth = isMobile ? cardHeight * (400 / 600) : 400;
    const imageSize = Math.min(cardWidth * 0.9, cardHeight * 0.85);
    const fontSize = cardWidth < 300 ? 'text-base' : 'text-2xl'; // Keep for now, will be replaced by custom CSS
    const iconSize = cardWidth < 300 ? 'text-6xl' : 'text-8xl'; // Keep for now, will be replaced by custom CSS

    return (
      <div
        className="player-card"
        style={{
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          padding: `${cardHeight * 0.04}px`
        }}
        onClick={onVote}
      >
        <div
          className="player-image-container"
          style={{
            width: `${imageSize}px`,
            height: `${imageSize}px`,
            marginBottom: `${cardHeight * 0.03}px`
          }}
        >
          {!imageError ? (
            <Image
              src={player.image_url}
              alt={player.name}
              width={imageSize}
              height={imageSize}
              unoptimized
              className="player-image"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={`player-icon-placeholder ${iconSize}`}>
              👤
            </div>
          )}
        </div>

        <h2 className={`player-name ${fontSize}`} style={{ marginBottom: `${cardHeight * 0.03}px` }}>
          {player.name}
        </h2>

        <div
          className="player-rating-badge"
          style={{
            padding: `${cardHeight * 0.01}px ${cardWidth * 0.04}px`
          }}
        >
          <span className={`player-rating-text ${cardWidth < 300 ? 'text-sm' : 'text-lg'}`}>
            ⭐ {Math.round(player.rating)}
          </span>
        </div>
      </div>
    );
  };

  const [player1, player2] = pair;

  return (
    <div>
      <header className="main-header">
        <Link
          href="/ranking"
          className="button bg-blue-500 text-white hover:bg-blue-600"
        >
          Ranking
        </Link>
        <Link
          href="/add-question"
          className="button bg-green-500 text-white hover:bg-green-600"
        >
          Adicionar Pergunta
        </Link>
        <Link
          href="/edit-player"
          className="button bg-purple-500 text-white hover:bg-purple-600"
        >
          Editar Jogadores
        </Link>
      </header>

      <div className="main-content">
        <h1 className="question-text">
          {question.text}
        </h1>

        <div className={`player-cards-container ${isMobile ? 'flex-col gap-6' : 'flex-row gap-8'}`}>
          {isLoading ? (
            <div
              className="loading-container"
              style={{ height: isMobile ? (screenHeight / 3) * 2 + 24 : 600 }}
            >
              <div className="loading-spinner">
                <div className="loading-dot" style={{ animationDelay: '-0.3s' }}></div>
                <div className="loading-dot" style={{ animationDelay: '-0.15s' }}></div>
                <div className="loading-dot"></div>
              </div>
              <p className="loading-text">Carregando nova rodada...</p>
            </div>
          ) : (
            <>
              <PlayerCard
                player={player1}
                onVote={() => handleVote(player1, player2)}
              />

              <PlayerCard
                player={player2}
                onVote={() => handleVote(player2, player1)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
