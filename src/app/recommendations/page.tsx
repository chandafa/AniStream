'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { animeRecommendations, AnimeRecommendationsOutput } from '@/ai/flows/anime-recommendations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialState: { error?: string, data?: AnimeRecommendationsOutput } = {};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
        Get Recommendations
      </Button>
    );
  }

export default function RecommendationsPage() {
  const [state, formAction] = useActionState(async (prevState: any, formData: FormData) => {
    try {
      const viewingHistory = (formData.get('viewingHistory') as string).split(',').map(s => s.trim()).filter(Boolean);
      const dislikedGenres = (formData.get('dislikedGenres') as string).split(',').map(s => s.trim()).filter(Boolean);
      
      if (viewingHistory.length === 0) {
        return { error: 'Please enter at least one anime you have watched.' };
      }

      const result = await animeRecommendations({ viewingHistory, dislikedGenres, numberOfRecommendations: 5 });
      return { data: result };
    } catch (error) {
      console.error(error);
      return { error: 'Failed to generate recommendations. Please try again.' };
    }
  }, initialState);

  return (
    <div className="container py-12">
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Wand2 className="text-primary" /> AI Anime Recommendations
                    </CardTitle>
                    <CardDescription>
                        Tell us what you&apos;ve watched and what you dislike, and our AI will suggest new anime for you to check out.
                    </CardDescription>
                </CardHeader>
                <form action={formAction}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="viewingHistory">What have you watched?</Label>
                            <Textarea
                                id="viewingHistory"
                                name="viewingHistory"
                                placeholder="e.g., Attack on Titan, Jujutsu Kaisen, Steins;Gate"
                                required
                            />
                             <p className="text-sm text-muted-foreground">
                                Separate titles with a comma.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dislikedGenres">Any genres you dislike?</Label>
                            <Input
                                id="dislikedGenres"
                                name="dislikedGenres"
                                placeholder="e.g., Horror, Mecha"
                            />
                            <p className="text-sm text-muted-foreground">
                                Separate genres with a comma.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <SubmitButton />
                        {state?.error && (
                            <Alert variant="destructive">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{state.error}</AlertDescription>
                            </Alert>
                        )}
                    </CardFooter>
                </form>
            </Card>

            {state?.data && state.data.recommendations.length > 0 && (
                <div className="mt-8">
                    <h2 className="font-headline text-2xl font-bold mb-4">Here are your recommendations:</h2>
                    <ul className="space-y-2">
                        {state.data.recommendations.map((rec, index) => (
                            <li key={index} className="p-4 bg-card rounded-md border text-lg font-medium">
                                {rec}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    </div>
  );
}
