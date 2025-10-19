# **App Name**: OtakuStream

## Core Features:

- Home/Hero Section: Displays a featured anime banner along with trending and popular anime listings.
- Anime Categories: Provides sections for popular, trending, latest, ongoing, and completed anime series. Data is fetched from the /anime/home and other relevant endpoints.
- Anime Detail Page: Presents detailed information for each anime, including synopsis, rating, genres, and a list of episodes, using the /anime/anime/:slug endpoint.
- Episode Watch Page: Offers a video player with next/previous episode navigation and a streaming server switch feature, utilizing the /anime/episode/:slug and /anime/server/:serverId endpoints.
- Search & Filter: Enables users to search for anime by keyword and filter by genre, with results displayed using pagination or infinite scroll. Uses the /anime/search/:keyword and /anime/genre/:slug endpoints.
- User Authentication: User System – Login, bookmarks/favorites, history.
- Recommendations: Suggesting Anime Titles, by comparing viewing history, tool will allow model to determine if titles are not in a disliked genre before incorporating it.

## Style Guidelines:

- Primary color: Deep Indigo (#663399) to capture a sense of immersion and sophistication, mirroring the depth of anime stories.
- Background color: Very dark gray (#222222) for a modern dark theme that reduces eye strain during long viewing sessions.
- Accent color: Electric Purple (#BF00FF) for highlights, buttons, and interactive elements to provide contrast and draw user attention.
- Headline font: 'Poppins' (sans-serif) for headlines; provides a contemporary and fashionable aesthetic, which works well for the modern anime streaming platform.
- Body font: 'PT Sans' (sans-serif) for body text; to be paired with 'Poppins' headlines.
- Use a consistent set of flat, minimalist icons for navigation and actions to maintain a clean and modern look.
- Implement a grid-based layout for displaying anime listings, ensuring responsiveness across different screen sizes.