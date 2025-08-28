import { createClient } from '@supabase/supabase-js'
import type { Player } from '../types'; // Import Player type

const supabaseUrl = 'https://itdplsvmsqognexmassy.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Function to get all players
export async function getAllPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*'); // Select all columns

  if (error) {
    console.error('Error fetching all players:', error);
    return [];
  }
  return data as Player[];
}

// Function to update a player's name
export async function updatePlayerName(playerId: number, newName: string): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase
    .from('players')
    .update({ name: newName })
    .eq('id', playerId);

  if (error) {
    console.error(`Error updating player ${playerId} name to ${newName}:`, error);
    return { success: false, error: error.message };
  }
  return { success: true };
}
