
import { doc, getDoc, updateDoc, setDoc, arrayUnion, arrayRemove, Firestore, increment, addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { HistoryItem } from './types';

const XP_PER_WATCH = 10;
const XP_PER_BOOKMARK = 5;

// Helper function to ensure user document exists
async function ensureUserDoc(firestore: Firestore, userId: string) {
    const userDocRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
        await setDoc(userDocRef, { bookmarks: [], history: [], xp: 0, level: 1, registrationDate: serverTimestamp() });
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
    const userDocSnap = await getDoc(userDocRef);
    const userData = userDocSnap.data();
    
    const history: HistoryItem[] = userData?.history ?? [];

    // Check if the exact same episode is already the most recent item in history.
    // This prevents adding XP for refreshing the same page.
    const lastHistoryItem = history.length > 0 ? history[history.length - 1] : null;
    if (lastHistoryItem && lastHistoryItem.episodeSlug === episodeSlug) {
        return; // Do nothing if it's the same episode
    }

    // Find if there's any history for this anime series
    const existingEntryIndex = history.findIndex(item => item.animeSlug === animeSlug);

    let updatedHistory = [...history];

    if (existingEntryIndex > -1) {
        // If an entry for this anime exists, remove it
        updatedHistory.splice(existingEntryIndex, 1);
    }
    
    // Add the new or updated entry to the end of the array
    updatedHistory.push({
        animeSlug,
        episodeSlug,
        watchedAt: Timestamp.now(),
    });

    await updateDoc(userDocRef, {
        history: updatedHistory,
        xp: increment(XP_PER_WATCH) // Grant XP for watching a new episode
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

    