/**
 * Calcula o novo rating Elo para dois jogadores.
 * @param winnerRating O rating atual do jogador vencedor.
 * @param loserRating O rating atual do jogador perdedor.
 * @param kFactor O fator K, que determina o impacto do resultado no rating. Padrão é 32.
 * @returns Um array com o novo rating do vencedor e do perdedor, respectivamente.
 */
export function calculateElo(
  winnerRating: number,
  loserRating: number,
  kFactor: number = 32
): [number, number] {
  // Calcula a probabilidade de vitória esperada para cada jogador
  const expectedWinnerProbability = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoserProbability = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

  // Calcula o novo rating para cada jogador
  const newWinnerRating = winnerRating + kFactor * (1 - expectedWinnerProbability);
  const newLoserRating = loserRating + kFactor * (0 - expectedLoserProbability);

  return [Math.round(newWinnerRating), Math.round(newLoserRating)];
}
