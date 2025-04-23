interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  previewUrl: string;
}

export class MusicRecommendationService {
  private emotionToGenre: { [key: string]: string[] } = {
    happy: ['pop', 'dance', 'electronic', 'indie-pop'],
    sad: ['blues', 'jazz', 'classical', 'soul'],
    angry: ['rock', 'metal', 'punk', 'hard-rock'],
    surprised: ['indie', 'alternative', 'experimental', 'art-pop'],
    fearful: ['ambient', 'new-age', 'instrumental', 'classical'],
    disgusted: ['industrial', 'metal', 'hard-rock', 'punk'],
    neutral: ['chill', 'acoustic', 'indie', 'folk']
  };

  constructor(private accessToken: string) {}

  async getRecommendations(emotion: string): Promise<MusicTrack[]> {
    try {
      const genres = this.emotionToGenre[emotion] || this.emotionToGenre.neutral;
      const randomGenre = genres[Math.floor(Math.random() * genres.length)];

      console.log('Using genre:', randomGenre);

      // 直接使用流派获取推荐
      const response = await fetch(
        `https://api.spotify.com/v1/recommendations?seed_genres=${randomGenre}&limit=5`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('Spotify API response:', await response.text());
        throw new Error(`Failed to fetch recommendations: ${response.status}`);
      }

      const data = await response.json();
      return data.tracks.map((track: any) => ({
        id: track.id,
        title: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        coverUrl: track.album.images[0].url,
        previewUrl: track.preview_url || '',
      }));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  }
} 