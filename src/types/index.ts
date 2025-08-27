export interface Player {
  id: number;
  name: string;
  image_url: string;
  rating: number; // This is the rating for a specific question
}

export interface Question {
  id: number;
  text: string;
}
