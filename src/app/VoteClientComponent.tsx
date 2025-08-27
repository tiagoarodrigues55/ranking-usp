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
    const fontSize = cardWidth < 300 ? 'text-lg' : 'text-2xl';
    const iconSize = cardWidth < 300 ? 'text-6xl' : 'text-8xl';

    return (
      <div
        className="relative flex flex-col items-center justify-center rounded-lg cursor-pointer bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all"
        style={{ 
          width: `${cardWidth}px`, 
          height: `${cardHeight}px`,
          padding: `${cardHeight * 0.04}px`
        }}
        onClick={onVote}
      >
        <div 
          className="rounded-lg overflow-hidden bg-gray-200 mb-2"
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
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-gray-400 ${iconSize}`}>
              👤
            </div>
          )}
        </div>
        
        <h2 className={`${fontSize} font-semibold text-center px-2`} style={{ marginBottom: `${cardHeight * 0.03}px` }}>
          {player.name}
        </h2>
        
        <div 
          className="bg-blue-100 rounded-full"
          style={{
            padding: `${cardHeight * 0.01}px ${cardWidth * 0.04}px`
          }}
        >
          <span className={`${cardWidth < 300 ? 'text-sm' : 'text-lg'} font-medium text-blue-800`}>
            ⭐ {Math.round(player.rating)}
          </span>
        </div>
      </div>
    );
  };

  const [player1, player2] = pair;

  return (
    <div>
      <header className="p-4 flex justify-between items-center">
        <Link 
          href="/ranking" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-center"
        >
          Ranking
        </Link>
        <Link 
          href="/add-question" 
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-center"
        >
          Adicionar Pergunta
        </Link>
      </header>

      <div className="flex flex-col items-center">
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-8 text-gray-800 px-4">
          {question.text}
        </h1>
        
        <div className={`flex items-center justify-center ${isMobile ? 'flex-col gap-6' : 'flex-row gap-8'}`}>
          {isLoading ? (
            <div 
              className="flex flex-col items-center justify-center"
              style={{ height: isMobile ? (screenHeight / 3) * 2 + 24 : 600 }}
            >
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
              <p className="mt-4 text-lg text-gray-600">Carregando nova rodada...</p>
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
