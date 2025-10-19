
import { doc, getDoc, updateDoc, setDoc, arrayUnion, arrayRemove, Firestore, increment } from 'firebase/firestore';

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
    animeSlug: string
) => {
    const userDocRef = await ensureUserDoc(firestore, userId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    // To avoid giving XP for re-watching the same episode/anime immediately,
    // we only add XP if it's not the most recent item in history.
    // A more robust solution might check timestamps.
    const history = userData?.history ?? [];
    if (history[history.length - 1] !== animeSlug) {
        await updateDoc(userDocRef, {
            history: arrayUnion(animeSlug),
            xp: increment(XP_PER_WATCH)
        });
    }
};

