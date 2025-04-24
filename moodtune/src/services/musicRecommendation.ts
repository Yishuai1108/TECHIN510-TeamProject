interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  uri: string;
}

// 添加Spotify Web Playback SDK的类型定义
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (config: {
        name: string;
        getOAuthToken: (callback: (token: string) => void) => void;
        volume?: number;
      }) => SpotifyPlayer;
    };
  }
}

interface SpotifyPlayer {
  connect: () => Promise<boolean>;
  addListener: (event: string, callback: (data: any) => void) => void;
  disconnect: () => void;
}

interface SpotifyError {
  message: string;
}

interface SpotifyPlayerState {
  track_window: {
    current_track: {
      name: string;
      artists: Array<{ name: string }>;
      album: { name: string; images: Array<{ url: string }> };
    };
  };
  paused: boolean;
  position: number;
  duration: number;
}

interface SpotifyDevice {
  device_id: string;
}

export class MusicRecommendationService {
  private emotionToGenre: { [key: string]: string[] } = {
    happy: ['pop', 'dance', 'electronic'],
    sad: ['pop', 'indie', 'acoustic'],
    angry: ['ambient', 'classical', 'acoustic'],
    surprised: ['indie', 'alternative', 'electronic'],
    fearful: ['ambient', 'classical', 'acoustic'],
    disgusted: ['ambient', 'classical', 'acoustic'],
    neutral: ['acoustic', 'ambient', 'classical']
  };

  private emotionToQuery: { [key: string]: string[] } = {
    happy: ['happy pop', 'upbeat dance', 'party hits', 'summer hits', 'feel good music'],
    sad: ['uplifting songs', 'positive vibes', 'feel better music', 'motivational', 'happy acoustic'],
    angry: ['calming music', 'peaceful songs', 'relaxing music', 'soothing', 'meditation'],
    surprised: ['new releases', 'trending music', 'indie hits', 'viral songs', 'popular now'],
    fearful: ['calming music', 'soothing songs', 'peaceful music', 'relaxing', 'meditation'],
    disgusted: ['calming music', 'peaceful songs', 'relaxing music', 'soothing', 'meditation'],
    neutral: ['chill music', 'study jazz', 'relaxing classical', 'background music', 'lo-fi']
  };

  private supportedGenres: string[] = [
    'acoustic', 'ambient', 'blues', 'chill', 'classical', 'country', 
    'dance', 'edm', 'electronic', 'folk', 'hip-hop', 'indie', 
    'jazz', 'metal', 'pop', 'rock', 'soul', 'techno'
  ];

  private availableGenres: string[] = [];

  private player: Spotify.Player | null = null;
  private deviceId: string | null = null;
  private playbackStateCallback: ((state: any) => void) | null = null;
  private isPremium: boolean = false;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(private accessToken: string) {
    console.log('MusicRecommendationService initialized with access token:', accessToken ? 'Present' : 'Missing');
    this.validateAccessToken();
    this.initializeGenres();
    this.initializePlayer();
  }

  private validateAccessToken() {
    if (!this.accessToken) {
      throw new Error('Access token is missing');
    }

    // 检查token格式
    if (!this.accessToken.startsWith('Bearer ')) {
      this.accessToken = `Bearer ${this.accessToken}`;
    }

    console.log('Access token format:', this.accessToken.substring(0, 20) + '...');
  }

  private async initializeGenres() {
    try {
      // 直接使用预定义的流派列表
      this.availableGenres = this.supportedGenres;
      console.log('✅ Using predefined supported genres:', this.availableGenres);
    } catch (error) {
      console.warn('⚠️ Using fallback supportedGenres due to error:', error);
      this.availableGenres = this.supportedGenres;
    }
  }

  /**
   * @deprecated This method is deprecated as the Spotify API endpoint is no longer available.
   * Use the supportedGenres list instead.
   */
  private async fetchAvailableGenres(): Promise<string[]> {
    console.warn('fetchAvailableGenres is deprecated. Using supportedGenres instead.');
    return this.supportedGenres;
  }

  private getValidGenresForEmotion(emotion: string): string[] {
    const emotionGenres = this.emotionToGenre[emotion.toLowerCase()] || ['pop'];
    // 只返回在 availableGenres 中存在的 genre
    const validGenres = emotionGenres.filter(genre => this.availableGenres.includes(genre));
    
    if (validGenres.length === 0) {
      console.log(`No valid genres found for emotion ${emotion}, using fallback genres`);
      return ['pop']; // 使用最基础的genre作为后备
    }
    
    console.log(`Valid genres for emotion ${emotion}:`, validGenres);
    return validGenres;
  }

  private async fetchRecommendationsWithOffset(query: string, offset: number): Promise<MusicTrack[]> {
    try {
      console.log(`Searching page ${offset / 50 + 1} for query: ${query}`);
      const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=50&offset=${offset}&market=US`;
      const response = await fetch(url, {
        headers: {
          'Authorization': this.accessToken
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.status}`);
      }

      const data = await response.json();
      const tracks = data.tracks.items.map((track: any) => ({
        id: track.id,
        title: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        coverUrl: track.album.images[0].url,
        uri: track.uri
      }));

      console.log(`Found ${tracks.length} tracks on page ${offset / 50 + 1} for query ${query}`);
      return tracks;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  }

  private async searchTracksWithPagination(query: string, maxPages: number = 4): Promise<MusicTrack[]> {
    const allTracks: MusicTrack[] = [];
    
    for (let page = 0; page < maxPages; page++) {
      const offset = page * 50;
      const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=50&offset=${offset}&market=US`;
      
      console.log(`Searching page ${page + 1} for query: ${query}`);
      
      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': this.accessToken,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.warn(`Failed to fetch page ${page + 1} for query ${query}:`, response.status);
          continue;
        }

        const data = await response.json();
        const tracks = data.tracks.items.map((track: any) => ({
          id: track.id,
          title: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          coverUrl: track.album.images[0]?.url || '/images/default-album.png',
          uri: track.uri
        }));
        
        if (tracks.length === 0) {
          console.log(`No more tracks found for query ${query} at page ${page + 1}`);
          break;
        }

        allTracks.push(...tracks);
        console.log(`Found ${tracks.length} tracks on page ${page + 1} for query ${query}`);
        
        // 如果已经找到足够多的歌曲，可以提前结束
        if (allTracks.length >= 5) {
          console.log(`Found enough tracks (${allTracks.length}) for query ${query}`);
          break;
        }
      } catch (error) {
        console.warn(`Error fetching page ${page + 1} for query ${query}:`, error);
        continue;
      }
    }

    return allTracks;
  }

  private async initializePlayer() {
    console.log('🎵 Starting player initialization...');
    
    // 确保SDK脚本已加载
    if (!window.Spotify) {
      console.log('🔄 Loading Spotify Web Playback SDK...');
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
          console.log('✅ Spotify Web Playback SDK is ready');
          this.initializePlayerWithSDK().then(resolve);
        };
      });
    } else {
      console.log('✅ Spotify SDK is already available');
      return this.initializePlayerWithSDK();
    }
  }

  private async initializePlayerWithSDK() {
    console.log('🎵 Initializing player with SDK...');
    // 检查用户是否为Premium用户
    try {
      console.log('🔍 Checking Premium status...');
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': this.accessToken
        }
      });
      
      if (!response.ok) {
        console.error('❌ Failed to check Premium status:', response.status);
        return;
      }
      
      const userInfo = await response.json();
      console.log('👤 User info:', {
        id: userInfo.id,
        product: userInfo.product,
        display_name: userInfo.display_name
      });
      
      this.isPremium = userInfo.product === 'premium';
      console.log('🎵 Is Premium?', this.isPremium);

      if (!this.isPremium) {
        console.warn('⚠️ User is not a Premium subscriber. Web Playback SDK requires Premium.');
        return;
      }

      const token = this.accessToken.replace('Bearer ', '');
      console.log('🔑 Initializing player with token:', token.substring(0, 10) + '...');

      this.player = new window.Spotify.Player({
        name: 'MoodTune Player',
        getOAuthToken: (callback: (token: string) => void) => { 
          console.log('🔑 Getting OAuth token...');
          callback(token); 
        },
        volume: 0.5
      });

      // 错误处理
      this.player.addListener('initialization_error', ({ message }: SpotifyError) => {
        console.error('❌ Failed to initialize:', message);
      });
      this.player.addListener('authentication_error', ({ message }: SpotifyError) => {
        console.error('❌ Failed to authenticate:', message);
        window.location.href = '/api/auth/spotify';
      });
      this.player.addListener('account_error', ({ message }: SpotifyError) => {
        console.error('❌ Failed to validate Spotify account:', message);
      });
      this.player.addListener('playback_error', ({ message }: SpotifyError) => {
        console.error('❌ Failed to perform playback:', message);
      });

      // 播放状态更新
      this.player.addListener('player_state_changed', (state: SpotifyPlayerState) => {
        console.log('🎵 Player state changed:', {
          track: state?.track_window?.current_track?.name,
          position: state?.position,
          duration: state?.duration,
          paused: state?.paused
        });
        if (this.playbackStateCallback) {
          this.playbackStateCallback(state);
        }
      });

      // 准备就绪
      this.player.addListener('ready', ({ device_id }: SpotifyDevice) => {
        console.log('✅ Player is ready with Device ID:', device_id);
        this.deviceId = device_id;
      });

      // 连接播放器
      const success = await this.player.connect();
      if (success) {
        console.log('✅ Successfully connected to Spotify!');
      } else {
        console.error('❌ Failed to connect to Spotify');
      }
    } catch (error) {
      console.error('❌ Error initializing player:', error);
    }
  }

  // 设置播放状态回调
  public setPlaybackStateCallback(callback: (state: any) => void) {
    this.playbackStateCallback = callback;
    // 启动定时更新
    this.startPlaybackStateUpdates();
  }

  // 移除播放状态回调
  public removePlaybackStateCallback() {
    this.playbackStateCallback = null;
    // 停止定时更新
    this.stopPlaybackStateUpdates();
  }

  // 启动播放状态更新
  private startPlaybackStateUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    // 每100毫秒更新一次状态
    this.updateInterval = setInterval(async () => {
      if (this.player && this.playbackStateCallback) {
        try {
          const state = await this.player.getCurrentState();
          if (state) {
            this.playbackStateCallback(state);
          }
        } catch (error) {
          console.error('Error getting current state:', error);
        }
      }
    }, 100);
  }

  // 停止播放状态更新
  private stopPlaybackStateUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  async playTrack(track: MusicTrack) {
    console.log('🎵 Attempting to play track:', {
      title: track.title,
      isPremium: this.isPremium,
      deviceId: this.deviceId,
      player: !!this.player
    });

    if (!this.isPremium) {
      console.warn('❌ Cannot play track: Premium account required');
      throw new Error('Spotify Premium account required to play music');
    }

    if (!this.deviceId) {
      console.warn('❌ Cannot play track: Player not ready');
      throw new Error('Player not ready. Please wait a moment and try again');
    }

    if (!track.uri) {
      console.warn('❌ Cannot play track: No URI provided');
      throw new Error('Invalid track: No playback URI available');
    }

    try {
      const token = this.accessToken.replace('Bearer ', '');
      console.log('🎵 Playing track:', {
        title: track.title,
        deviceId: this.deviceId,
        uri: track.uri
      });

      // 尝试最多3次播放
      let retryCount = 0;
      const maxRetries = 3;
      let lastError = null;

      while (retryCount < maxRetries) {
        try {
          console.log(`🔄 Attempt ${retryCount + 1} to play track...`);
          const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              uris: [track.uri]
            })
          });

          if (response.ok) {
            console.log('✅ Successfully started playback');
            return;
          }

          const errorText = await response.text();
          console.error(`❌ Failed to play track (attempt ${retryCount + 1}):`, {
            status: response.status,
            error: errorText
          });
          
          if (response.status === 404) {
            console.log('🔄 Device may be disconnected, reinitializing player...');
            await this.initializePlayer();
          }
          
          lastError = new Error(`Failed to play track: ${response.status} - ${errorText}`);
          retryCount++;
          
          if (retryCount < maxRetries) {
            console.log(`⏳ Waiting before retry ${retryCount + 1}...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        } catch (error) {
          console.error(`❌ Error playing track (attempt ${retryCount + 1}):`, error);
          lastError = error;
          retryCount++;
          
          if (retryCount < maxRetries) {
            console.log(`⏳ Waiting before retry ${retryCount + 1}...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      }

      throw lastError || new Error('Failed to play track after multiple attempts');
    } catch (error) {
      console.error('❌ Error playing track:', error);
      throw error;
    }
  }

  async pausePlayback() {
    if (!this.isPremium || !this.deviceId) return;

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${this.deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': this.accessToken
        }
      });

      if (!response.ok) {
        throw new Error('Failed to pause playback');
      }
    } catch (error) {
      console.error('Error pausing playback:', error);
    }
  }

  async getRecommendations(emotion: string): Promise<MusicTrack[]> {
    console.log(`🎵 Getting recommendations for emotion: ${emotion}`);
    
    // 获取情绪对应的搜索关键词
    const queries = this.emotionToQuery[emotion as keyof typeof this.emotionToQuery] || ['chill music'];
    console.log(`🔍 Using search queries:`, queries);

    // 尝试每个搜索关键词
    for (const query of queries) {
      try {
        console.log(`🔍 Trying search query: ${query}`);
        const tracks = await this.fetchRecommendations(query);
        if (tracks.length > 0) {
          console.log(`✅ Found ${tracks.length} tracks for query ${query}`);
          return tracks;
        }
      } catch (error) {
        console.warn(`⚠️ Failed to fetch tracks for query ${query}:`, error);
        continue;
      }
    }

    throw new Error('No tracks found for any query');
  }

  private async fetchRecommendations(query: string): Promise<MusicTrack[]> {
    console.log(`🔍 Searching for query: ${query}`);
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=50&market=US`;
    
    try {
      // 验证token
      const userResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': this.accessToken
        }
      });
      
      if (!userResponse.ok) {
        if (userResponse.status === 401) {
          console.error('❌ Access token expired or invalid. Please re-authenticate with Spotify.');
          // 触发重新认证
          window.location.href = '/api/auth/spotify';
          throw new Error('Access token expired. Redirecting to login...');
        }
        throw new Error(`Access token validation failed with status ${userResponse.status}. Please re-authenticate.`);
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': this.accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Search API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const tracks = data.tracks.items;

      if (!tracks || tracks.length === 0) {
        throw new Error('No tracks found');
      }

      // 过滤并转换歌曲数据
      const validTracks = tracks
        .filter((track: any) => track.artists && track.artists.length > 0)
        .map((track: any) => ({
          id: track.id,
          title: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          coverUrl: track.album.images[0]?.url || '',
          uri: track.uri
        }));

      if (validTracks.length === 0) {
        throw new Error('No valid tracks found');
      }

      return validTracks;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  }
} 