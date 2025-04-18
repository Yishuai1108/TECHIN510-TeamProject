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
    happy: ['pop', 'dance', 'electronic'],
    sad: ['blues', 'jazz', 'classical'],
    angry: ['rock', 'metal', 'punk'],
    surprised: ['experimental', 'alternative', 'indie'],
    fearful: ['ambient', 'new-age', 'instrumental'],
    disgusted: ['industrial', 'noise', 'experimental'],
    neutral: ['chill', 'lounge', 'acoustic']
  };

  private mockTracks: MusicTrack[] = [
    {
      id: '1',
      title: 'Sunshine After Rain',
      artist: 'Happy Vibes',
      album: 'Positive Energy',
      coverUrl: '/images/album1.jpg',
      previewUrl: 'https://example.com/preview1.mp3'
    },
    {
      id: '2',
      title: 'Rainy Day Blues',
      artist: 'Moody Tunes',
      album: 'Emotional Journey',
      coverUrl: '/images/album2.jpg',
      previewUrl: 'https://example.com/preview2.mp3'
    },
    {
      id: '3',
      title: 'Rock Revolution',
      artist: 'Power Band',
      album: 'Energy Boost',
      coverUrl: '/images/album3.jpg',
      previewUrl: 'https://example.com/preview3.mp3'
    }
  ];

  async getRecommendations(emotion: string): Promise<MusicTrack[]> {
    // In a real application, this would call a music API
    // For now, we'll return mock data based on emotion
    const genres = this.emotionToGenre[emotion] || this.emotionToGenre.neutral;
    return this.mockTracks.filter(track => 
      genres.some(genre => track.title.toLowerCase().includes(genre))
    );
  }
} 