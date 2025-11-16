

import { doc, getDoc, updateDoc, setDoc, arrayUnion, arrayRemove, Firestore, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import type { HistoryItem } from './types';

const XP_PER_WATCH = 10;
const XP_PER_BOOKMARK = 5;

// Helper function to ensure user document exists
async function ensureUserDoc(firestore: Firestore, userId: string) {
    const userDocRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
        await setDoc(userDocRef, { bookmarks: [], history: [], xp: 0, level: 1 });
    }
    return userDocRef;
}


// Helper function to check if an anime is bookmarked
export const isBookmarked = (userData: any, animeSlug: string | undefined): boolean => {
    if (!userData || !animeSlug) return false;
    return userData.bookmarks?.includes(animeSlug) ?? false;
};

// Function to toggle a bookmark
export const toggleBookmark = async (
    firestore: Firestore,
    userId: string,
    animeSlug: string
) => {
    const userDocRef = await ensureUserDoc(firestore, userId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();
    
    const isCurrentlyBookmarked = userData?.bookmarks?.includes(animeSlug) ?? false;

    if (isCurrentlyBookmarked) {
        // Atomically remove the anime slug and decrease XP
        await updateDoc(userDocRef, {
            bookmarks: arrayRemove(animeSlug),
            xp: increment(-XP_PER_BOOKMARK)
        });
    } else {
        // Atomically add the anime slug and increase XP
        await updateDoc(userDocRef, {
            bookmarks: arrayUnion(animeSlug),
            xp: increment(XP_PER_BOOKMARK)
        });
    }
};

// Function to add to viewing history
export const addToHistory = async (
    firestore: Firestore,
    userId: string,
    animeSlug: string,
    episodeSlug: string
) => {
    const userDocRef = await ensureUserDoc(firestore, userId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();
    
    const history: HistoryItem[] = userData?.history ?? [];

    // Remove existing entry for the same anime series
    const updatedHistory = history.filter(item => item.animeSlug !== animeSlug);

    // Add the new episode as the most recent entry for this series
    updatedHistory.push({
        animeSlug,
        episodeSlug,
        watchedAt: serverTimestamp(),
    });
    
    // To avoid giving XP for re-watching the same episode immediately,
    // we only add XP if it's not the most recent item in history.
    const lastItem = history.length > 0 ? history[history.length - 1] : null;
    const shouldAddXp = !lastItem || lastItem.episodeSlug !== episodeSlug;

    await updateDoc(userDocRef, {
        history: updatedHistory,
        ...(shouldAddXp && { xp: increment(XP_PER_WATCH) })
    });
};

export const addComment = async (
    firestore: Firestore,
    episodeId: string,
    userId: string,
    username: string,
    userPhotoURL: string | null,
    text: string
) => {
    const commentsColRef = collection(firestore, 'episodes', episodeId, 'comments');
    await addDoc(commentsColRef, {
        episodeId,
        userId,
        username,
        userPhotoURL: userPhotoURL ?? '',
        text,
        timestamp: serverTimestamp(),
    });
};

    