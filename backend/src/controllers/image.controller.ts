import { Request, Response } from 'express';

// Define the unified image interface
interface UnifiedImage {
  id: string;
  url: string; // The high-res URL for the canvas
  thumbnailUrl: string; // The low-res URL for the sidebar
  provider: 'unsplash' | 'pexels' | 'pixabay' | 'mock';
  author: string;
}

export const searchImages = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string || 'trending';
    const page = parseInt(req.query.page as string) || 1;
    
    const UNSPLASH_KEY = process.env.UNSPLASH_API_KEY;
    const PEXELS_KEY = process.env.PEXELS_API_KEY;
    const PIXABAY_KEY = process.env.PIXABAY_API_KEY;

    let results: UnifiedImage[] = [];

    // If keys are missing, return high-quality mock data so the UI works flawlessly
    // We use loremflickr to ensure the images actually match the user's search query!
    if (!UNSPLASH_KEY && !PEXELS_KEY && !PIXABAY_KEY) {
      const keyword = query && query !== 'trending' && query !== 'All' ? encodeURIComponent(query as string) : 'nature';
      
      for (let i = 0; i < 20; i++) {
        const seedId = (page * 20 + i) % 1000;
        results.push({
          id: `mock-${page}-${i}-${seedId}`, 
          url: `https://loremflickr.com/800/600/${keyword}?lock=${seedId}`,
          thumbnailUrl: `https://loremflickr.com/300/200/${keyword}?lock=${seedId}`,
          provider: 'mock',
          author: `${decodeURIComponent(keyword)} photo ${seedId}`
        });
      }
      return res.status(200).json({ images: results, page, query });
    }

    // TODO: In a real production app, we would make parallel Promise.all() requests to Unsplash, Pexels, and Pixabay.
    // For this implementation, we will query Unsplash if available.
    if (UNSPLASH_KEY) {
      const unsplashUrl = query === 'trending' 
        ? `https://api.unsplash.com/photos?page=${page}&per_page=20` 
        : `https://api.unsplash.com/search/photos?page=${page}&query=${query}&per_page=20`;
        
      const response = await fetch(unsplashUrl, {
        headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` }
      });
      const data = await response.json();
      
      const items = query === 'trending' ? data : data.results;
      if (items && items.length > 0) {
        items.forEach((item: any) => {
          results.push({
            id: item.id,
            url: item.urls.regular,
            thumbnailUrl: item.urls.small,
            provider: 'unsplash',
            author: item.user.name
          });
        });
      }
    }

    res.status(200).json({ images: results, page, query });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching images" });
  }
};
