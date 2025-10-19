// src/ai/flows/anime-recommendations.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for recommending anime titles to users
 * based on their viewing history and disliked genres.
 *
 * - animeRecommendations - A function that generates anime recommendations for a user.
 * - AnimeRecommendationsInput - The input type for the animeRecommendations function.
 * - AnimeRecommendationsOutput - The return type for the animeRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnimeRecommendationsInputSchema = z.object({
  viewingHistory: z.array(
    z.string().describe('Anime titles the user has watched.')
  ).describe('The user viewing history as a list of anime titles.'),
  dislikedGenres: z.array(
    z.string().describe('Genres the user dislikes.')
  ).describe('A list of genres the user has marked as disliked.'),
  numberOfRecommendations: z.number().default(5).describe('The number of anime recommendations to return.'),
});
export type AnimeRecommendationsInput = z.infer<typeof AnimeRecommendationsInputSchema>;

const AnimeRecommendationsOutputSchema = z.object({
  recommendations: z.array(
    z.string().describe('Recommended anime titles.')
  ).describe('A list of recommended anime titles based on viewing history and disliked genres.'),
});
export type AnimeRecommendationsOutput = z.infer<typeof AnimeRecommendationsOutputSchema>;


export async function animeRecommendations(input: AnimeRecommendationsInput): Promise<AnimeRecommendationsOutput> {
  return animeRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'animeRecommendationsPrompt',
  input: { schema: AnimeRecommendationsInputSchema },
  output: { schema: AnimeRecommendationsOutputSchema },
  prompt: `You are an AI anime recommendation expert. Given a user's viewing history and disliked genres, you will recommend anime titles the user might enjoy.  Ensure that the recommendations do not include any anime from the user's disliked genres.

Viewing History:
{{#each viewingHistory}}- {{this}}\n{{/each}}

Disliked Genres:
{{#each dislikedGenres}}- {{this}}\n{{/each}}

Ensure that the recommendations do not include any anime from the user's disliked genres.

Please provide {{numberOfRecommendations}} recommendations. Return just the names of the anime.  No explanation or other text is required.  Output MUST be a JSON array of strings.

For example:

{
  "recommendations": [
    "Anime Title 1",
    "Anime Title 2",
    "Anime Title 3",
    "Anime Title 4",
    "Anime Title 5"
  ]
}
`,
});

const animeRecommendationsFlow = ai.defineFlow(
  {
    name: 'animeRecommendationsFlow',
    inputSchema: AnimeRecommendationsInputSchema,
    outputSchema: AnimeRecommendationsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
