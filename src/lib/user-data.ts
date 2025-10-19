
import { doc, getDoc, updateDoc, setDoc, arrayUnion, arrayRemove, Firestore } from 'firebase/firestore';

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
    const userDocRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        // If the user document doesn't exist, create it with the first bookmark
        await setDoc(userDocRef, { bookmarks: [animeSlug], history: [] });
    } else {
        const userData = userDoc.data();
        const isCurrentlyBookmarked = userData.bookmarks?.includes(animeSlug) ?? false;

        if (isCurrentlyBookmarked) {
            // Atomically remove the anime slug from the 'bookmarks' array
            await updateDoc(userDocRef, {
                bookmarks: arrayRemove(animeSlug)
            });
        } else {
            // Atomically add the anime slug to the 'bookmarks' array
            await updateDoc(userDocRef, {
                bookmarks: arrayUnion(animeSlug)
            });
        }
    }
};

// Function to add to viewing history
export const addToHistory = async (
    firestore: Firestore,
    userId: string,
    animeSlug: string
) => {
    const userDocRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
         await setDoc(userDocRef, { bookmarks: [], history: [animeSlug] });
    } else {
        await updateDoc(userDocRef, {
            history: arrayUnion(animeSlug)
        });
    }
};
