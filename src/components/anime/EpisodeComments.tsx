
'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { addComment } from '@/lib/user-data';
import { formatDistanceToNow } from 'date-fns';
import type { Comment } from '@/lib/types';

interface EpisodeCommentsProps {
  episodeId: string;
}

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export function EpisodeComments({ episodeId }: EpisodeCommentsProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commentsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'episodes', episodeId, 'comments'), orderBy('timestamp', 'desc')) : null
  , [firestore, episodeId]);

  const { data: comments, isLoading: isLoadingComments } = useCollection<Comment>(commentsQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      await addComment(
        firestore,
        episodeId,
        user.uid,
        user.displayName || 'Anonymous',
        user.photoURL,
        comment
      );
      setComment('');
      toast({
        title: 'Success',
        description: 'Your comment has been posted.',
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to post your comment. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-transparent border-border/50">
      <CardHeader>
        <CardTitle>Comments ({comments?.length ?? 0})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.photoURL ?? ''} />
                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
              </Avatar>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a public comment..."
                className="bg-card/50 border-border/50 placeholder:text-muted-foreground"
                rows={2}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={!comment.trim() || isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Comment
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4 bg-card/30 rounded-md">
            <p className="text-muted-foreground">
              <Link href="/login" className="text-primary underline">Login</Link> to post a comment.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {isLoadingComments && <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
          {!isLoadingComments && comments && comments.length === 0 && (
            <p className="text-center text-muted-foreground">Be the first to comment!</p>
          )}
          {comments?.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={comment.userPhotoURL ?? ''} />
                <AvatarFallback>{getInitials(comment.username)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">{comment.username}</span>
                  <span className="text-xs text-muted-foreground">
                    {comment.timestamp ? formatDistanceToNow(comment.timestamp.toDate(), { addSuffix: true }) : 'just now'}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
