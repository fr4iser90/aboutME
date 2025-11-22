# 📱 Social Media Integration Dokumentation

## 📋 Übersicht

Diese Dokumentation beschreibt die geplanten Social Media Integrationen für **aboutME**, welche Block-Types benötigt werden und was technisch möglich ist.

---

## 🎬 YouTube Integration

### Aktueller Status

**Bereits vorhanden:**
- ✅ `video` Block-Type mit `source: 'youtube'`
- ✅ YouTube Video Embed (iframe)
- ✅ Video ID Support

**Beispiel:**
```typescript
const youtubeBlock: VideoBlock = {
  id: 'youtube-1',
  type: 'video',
  source: 'youtube',
  videoId: 'dQw4w9WgXcQ',
  autoplay: false
}
```

---

### Was noch gebraucht wird

#### 1. **YouTube API Integration**

**YouTube Data API v3** Features:
- ✅ Video-Informationen abrufen (Title, Description, Thumbnail, etc.)
- ✅ Video-Statistiken (Views, Likes, Comments, Duration)
- ✅ Playlist-Informationen
- ✅ Channel-Informationen
- ✅ Video-History Import

**API Limits:**
- **Standard**: 10.000 Queries/Tag
- **Quota**: Pro Query 1-100 Units (je nach Endpoint)

**Benötigte Endpoints:**
- `videos.list` - Video-Details
- `playlists.list` - Playlist-Informationen
- `channels.list` - Channel-Informationen
- `search.list` - Video-Suche
- `playlistItems.list` - Playlist-Videos

---

#### 2. **Neue Block-Types**

##### **youtube-video** (erweitert)
```typescript
interface YouTubeVideoBlock extends BaseBlock {
  type: 'youtube-video'
  videoId: string
  // Auto-fetched from API
  title?: string
  description?: string
  thumbnail?: string
  duration?: number
  views?: number
  likes?: number
  publishedAt?: string
  channelTitle?: string
  // Display options
  showStats?: boolean
  showDescription?: boolean
  showThumbnail?: boolean
  autoplay?: boolean
  controls?: boolean
  startTime?: number // Start at specific time
  endTime?: number   // End at specific time
}
```

**Features:**
- Automatisches Laden von Video-Metadaten
- Statistiken anzeigen
- Thumbnail mit Play-Button
- Custom Start/End Time

---

##### **youtube-playlist**
```typescript
interface YouTubePlaylistBlock extends BaseBlock {
  type: 'youtube-playlist'
  playlistId: string
  // Auto-fetched from API
  title?: string
  description?: string
  thumbnail?: string
  videoCount?: number
  // Display options
  layout?: 'grid' | 'list' | 'carousel'
  columns?: number
  showStats?: boolean
  maxVideos?: number // Limit displayed videos
}
```

**Features:**
- Playlist-Grid/List anzeigen
- Automatisches Laden aller Videos
- Playlist-Statistiken

---

##### **youtube-stats**
```typescript
interface YouTubeStatsBlock extends BaseBlock {
  type: 'youtube-stats'
  channelId: string
  // Auto-fetched from API
  subscriberCount?: number
  videoCount?: number
  totalViews?: number
  // Display options
  layout?: 'horizontal' | 'vertical' | 'grid'
  showIcons?: boolean
  formatNumbers?: boolean // 1.2M instead of 1200000
}
```

**Features:**
- Channel-Statistiken
- Automatisches Formatieren (1.2M, 5.3K)
- Verschiedene Layouts

---

##### **youtube-timeline**
```typescript
interface YouTubeTimelineBlock extends BaseBlock {
  type: 'youtube-timeline'
  channelId: string
  // Auto-fetched from API
  videos?: Array<{
    videoId: string
    title: string
    thumbnail: string
    publishedAt: string
    views: number
  }>
  // Display options
  maxVideos?: number
  showThumbnails?: boolean
  showStats?: boolean
  sortBy?: 'date' | 'views' | 'likes'
}
```

**Features:**
- Chronologische Video-Timeline
- Automatisches Sortieren
- Video-History Import

---

#### 3. **YouTube Data Pipeline**

**Setup Wizard Integration:**
- [ ] YouTube Channel ID eingeben
- [ ] API Key konfigurieren (optional, für erweiterte Features)
- [ ] Video-History Import
- [ ] Playlist-Import

**Automatische Features:**
- [ ] Video-Metadaten beim Import laden
- [ ] Thumbnails herunterladen/cachen
- [ ] Statistiken regelmäßig aktualisieren
- [ ] Neue Videos automatisch erkennen

---

#### 4. **YouTube Block Components**

**Komponenten:**
- `YouTubeVideoBlock.tsx` - Video-Embed mit Metadaten
- `YouTubePlaylistBlock.tsx` - Playlist-Grid/List
- `YouTubeStatsBlock.tsx` - Channel-Statistiken
- `YouTubeTimelineBlock.tsx` - Video-Timeline

**Utilities:**
- `youtubeApi.ts` - YouTube API Client
- `youtubeUtils.ts` - Helper Functions
- `youtubeCache.ts` - Caching für API-Responses

---

### YouTube API Endpoints

#### **Video Details**
```
GET https://www.googleapis.com/youtube/v3/videos
?part=snippet,statistics,contentDetails
&id={videoId}
&key={API_KEY}
```

**Response:**
```json
{
  "items": [{
    "snippet": {
      "title": "Video Title",
      "description": "Video Description",
      "thumbnails": {...},
      "publishedAt": "2025-01-01T00:00:00Z",
      "channelTitle": "Channel Name"
    },
    "statistics": {
      "viewCount": "1234567",
      "likeCount": "12345",
      "commentCount": "123"
    },
    "contentDetails": {
      "duration": "PT10M30S"
    }
  }]
}
```

#### **Playlist Items**
```
GET https://www.googleapis.com/youtube/v3/playlistItems
?part=snippet,contentDetails
&playlistId={playlistId}
&maxResults=50
&key={API_KEY}
```

#### **Channel Statistics**
```
GET https://www.googleapis.com/youtube/v3/channels
?part=statistics,snippet
&id={channelId}
&key={API_KEY}
```

---

## 🐦 Twitter/X Integration

### Was gebraucht wird

#### 1. **Twitter API Integration**

**Twitter API v2** Features:
- ✅ Tweet-Informationen abrufen
- ✅ Tweet-History Import
- ✅ User-Statistiken (Followers, Tweets, etc.)
- ✅ Timeline-Import

**API Limits:**
- **Free Tier**: 1.500 Tweets/15min
- **Basic Tier**: 3.000 Tweets/15min
- **Pro Tier**: 10.000 Tweets/15min

**Benötigte Endpoints:**
- `tweets` - Tweet-Details
- `users/by/username` - User-Informationen
- `users/{id}/tweets` - User-Timeline

---

#### 2. **Neue Block-Types**

##### **twitter-tweet**
```typescript
interface TwitterTweetBlock extends BaseBlock {
  type: 'twitter-tweet'
  tweetId: string
  // Auto-fetched from API
  text?: string
  author?: string
  authorHandle?: string
  authorAvatar?: string
  createdAt?: string
  likes?: number
  retweets?: number
  replies?: number
  // Display options
  showStats?: boolean
  showMedia?: boolean
  embed?: boolean // Use Twitter oEmbed
}
```

**Features:**
- Tweet-Embed mit Metadaten
- Twitter oEmbed Support
- Automatisches Laden von Tweet-Details

---

##### **twitter-timeline**
```typescript
interface TwitterTimelineBlock extends BaseBlock {
  type: 'twitter-timeline'
  username: string
  // Auto-fetched from API
  tweets?: Array<{
    tweetId: string
    text: string
    createdAt: string
    likes: number
    retweets: number
  }>
  // Display options
  maxTweets?: number
  showStats?: boolean
  layout?: 'list' | 'grid'
}
```

**Features:**
- Twitter-Timeline anzeigen
- Automatisches Laden neuer Tweets
- Tweet-History Import

---

##### **twitter-stats**
```typescript
interface TwitterStatsBlock extends BaseBlock {
  type: 'twitter-stats'
  username: string
  // Auto-fetched from API
  followers?: number
  following?: number
  tweets?: number
  // Display options
  layout?: 'horizontal' | 'vertical'
  formatNumbers?: boolean
}
```

**Features:**
- Twitter-Statistiken
- Automatisches Formatieren

---

## 💼 LinkedIn Integration

### Was gebraucht wird

#### 1. **LinkedIn API Integration**

**LinkedIn API v2** Features:
- ✅ Professional Experience Import
- ✅ Skills & Endorsements
- ✅ Recommendations
- ✅ Education History

**API Limits:**
- **Standard**: 500 Requests/Tag
- **Rate Limit**: 100 Requests/15min

**Benötigte Endpoints:**
- `people/(id)` - Profile-Informationen
- `people/(id)/experience` - Berufserfahrung
- `people/(id)/skills` - Skills

---

#### 2. **Neue Block-Types**

##### **linkedin-experience**
```typescript
interface LinkedInExperienceBlock extends BaseBlock {
  type: 'linkedin-experience'
  profileId: string
  // Auto-fetched from API
  experiences?: Array<{
    title: string
    company: string
    startDate: string
    endDate?: string
    description?: string
    location?: string
  }>
  // Display options
  layout?: 'timeline' | 'list' | 'card'
  showDescription?: boolean
}
```

**Features:**
- Berufserfahrung automatisch importieren
- Timeline-Ansicht
- Card-Ansicht

---

##### **linkedin-skills**
```typescript
interface LinkedInSkillsBlock extends BaseBlock {
  type: 'linkedin-skills'
  profileId: string
  // Auto-fetched from API
  skills?: Array<{
    name: string
    endorsements: number
  }>
  // Display options
  showEndorsements?: boolean
  sortBy?: 'name' | 'endorsements'
}
```

**Features:**
- Skills mit Endorsements
- Automatisches Sortieren

---

##### **linkedin-recommendations**
```typescript
interface LinkedInRecommendationsBlock extends BaseBlock {
  type: 'linkedin-recommendations'
  profileId: string
  // Auto-fetched from API
  recommendations?: Array<{
    author: string
    text: string
    createdAt: string
  }>
  // Display options
  maxRecommendations?: number
  layout?: 'list' | 'card'
}
```

**Features:**
- Empfehlungen anzeigen
- Card-Ansicht

---

## 📷 Instagram Integration

### Was gebraucht wird

#### 1. **Instagram API Integration**

**Instagram Basic Display API** / **Instagram Graph API**:
- ✅ Photo Feed Import
- ✅ Story Highlights
- ✅ User-Statistiken

**API Limits:**
- **Basic Display**: 200 Requests/Stunde
- **Graph API**: Variiert je nach Endpoint

**Benötigte Endpoints:**
- `me/media` - User Media
- `{media-id}` - Media Details
- `me` - User Information

---

#### 2. **Neue Block-Types**

##### **instagram-feed**
```typescript
interface InstagramFeedBlock extends BaseBlock {
  type: 'instagram-feed'
  username: string
  // Auto-fetched from API
  posts?: Array<{
    id: string
    imageUrl: string
    caption?: string
    likes?: number
    comments?: number
    createdAt: string
  }>
  // Display options
  layout?: 'grid' | 'masonry' | 'carousel'
  columns?: number
  maxPosts?: number
  showStats?: boolean
}
```

**Features:**
- Instagram Feed anzeigen
- Grid/Masonry Layout
- Automatisches Laden neuer Posts

---

##### **instagram-highlights**
```typescript
interface InstagramHighlightsBlock extends BaseBlock {
  type: 'instagram-highlights'
  username: string
  // Auto-fetched from API
  highlights?: Array<{
    id: string
    title: string
    coverImage: string
    storyCount: number
  }>
  // Display options
  layout?: 'grid' | 'carousel'
}
```

**Features:**
- Story Highlights anzeigen
- Cover-Images

---

##### **instagram-stats**
```typescript
interface InstagramStatsBlock extends BaseBlock {
  type: 'instagram-stats'
  username: string
  // Auto-fetched from API
  followers?: number
  following?: number
  posts?: number
  // Display options
  layout?: 'horizontal' | 'vertical'
  formatNumbers?: boolean
}
```

**Features:**
- Instagram-Statistiken
- Automatisches Formatieren

---

## 🎯 Kombinierte Social Media Blocks

### **social-stats**
```typescript
interface SocialStatsBlock extends BaseBlock {
  type: 'social-stats'
  platforms: {
    youtube?: { channelId: string }
    twitter?: { username: string }
    instagram?: { username: string }
    linkedin?: { profileId: string }
  }
  // Auto-fetched from APIs
  stats?: {
    youtube?: { subscribers: number, videos: number }
    twitter?: { followers: number, tweets: number }
    instagram?: { followers: number, posts: number }
    linkedin?: { connections: number }
  }
  // Display options
  layout?: 'grid' | 'list' | 'card'
  showIcons?: boolean
  formatNumbers?: boolean
}
```

**Features:**
- Alle Social Media Statistiken in einem Block
- Automatisches Laden von allen Plattformen
- Einheitliche Darstellung

---

## 🔧 Technische Implementierung

### API Client Struktur

```
src/features/social-media/
├── api/
│   ├── youtube/
│   │   ├── youtubeApi.ts
│   │   ├── youtubeTypes.ts
│   │   └── youtubeCache.ts
│   ├── twitter/
│   │   ├── twitterApi.ts
│   │   ├── twitterTypes.ts
│   │   └── twitterCache.ts
│   ├── linkedin/
│   │   ├── linkedinApi.ts
│   │   ├── linkedinTypes.ts
│   │   └── linkedinCache.ts
│   └── instagram/
│       ├── instagramApi.ts
│       ├── instagramTypes.ts
│       └── instagramCache.ts
├── blocks/
│   ├── YouTubeVideoBlock.tsx
│   ├── YouTubePlaylistBlock.tsx
│   ├── YouTubeStatsBlock.tsx
│   ├── YouTubeTimelineBlock.tsx
│   ├── TwitterTweetBlock.tsx
│   ├── TwitterTimelineBlock.tsx
│   ├── TwitterStatsBlock.tsx
│   ├── LinkedInExperienceBlock.tsx
│   ├── LinkedInSkillsBlock.tsx
│   ├── LinkedInRecommendationsBlock.tsx
│   ├── InstagramFeedBlock.tsx
│   ├── InstagramHighlightsBlock.tsx
│   ├── InstagramStatsBlock.tsx
│   └── SocialStatsBlock.tsx
└── utils/
    ├── socialMediaUtils.ts
    └── socialMediaCache.ts
```

---

### Caching Strategy

**Warum Caching?**
- API Rate Limits
- Performance
- Kostenreduzierung

**Caching-Strategie:**
- **Statistiken**: 1 Stunde Cache
- **Video/Post Details**: 24 Stunden Cache
- **Timeline/Feed**: 15 Minuten Cache
- **User Info**: 1 Stunde Cache

**Storage:**
- Redis (Server-Side)
- LocalStorage (Client-Side für UI)

---

### Rate Limiting

**Pro Platform:**
- YouTube: 10.000 Queries/Tag
- Twitter: 1.500 Tweets/15min
- LinkedIn: 500 Requests/Tag
- Instagram: 200 Requests/Stunde

**Strategie:**
- Request-Queue
- Exponential Backoff
- Cache-First Approach
- Batch-Requests wo möglich

---

## 📊 Datenstruktur

### YouTube Data
```typescript
interface YouTubeData {
  videos: Array<{
    id: string
    title: string
    description: string
    thumbnail: string
    duration: number
    views: number
    likes: number
    publishedAt: string
    channelTitle: string
  }>
  playlists: Array<{
    id: string
    title: string
    videoCount: number
    videos: string[] // Video IDs
  }>
  channel: {
    id: string
    title: string
    subscribers: number
    videoCount: number
    totalViews: number
  }
}
```

### Twitter Data
```typescript
interface TwitterData {
  tweets: Array<{
    id: string
    text: string
    author: string
    createdAt: string
    likes: number
    retweets: number
    replies: number
  }>
  user: {
    username: string
    followers: number
    following: number
    tweets: number
  }
}
```

---

## 🚀 Setup Wizard Integration

### Social Media Setup Step

**Features:**
- [ ] Platform-Auswahl (YouTube, Twitter, LinkedIn, Instagram)
- [ ] API-Keys konfigurieren (optional)
- [ ] Account-Verbindung
- [ ] Daten-Import (Videos, Tweets, etc.)
- [ ] Auto-Update Einstellungen

**UI:**
```
┌─────────────────────────────────────┐
│ 📱 Social Media Integration          │
├─────────────────────────────────────┤
│                                      │
│ ☑️ YouTube                           │
│    Channel ID: [___________]         │
│    API Key: [___________] (optional) │
│    [Import Videos]                   │
│                                      │
│ ☐ Twitter/X                         │
│    Username: [___________]           │
│    [Connect Account]                 │
│                                      │
│ ☐ LinkedIn                          │
│    Profile ID: [___________]         │
│    [Connect Account]                 │
│                                      │
│ ☐ Instagram                         │
│    Username: [___________]           │
│    [Connect Account]                 │
│                                      │
└─────────────────────────────────────┘
```

---

## 📝 Zusammenfassung

### YouTube
- ✅ Basis-Video-Embed vorhanden
- 🔄 Erweiterte Block-Types benötigt
- 🔄 API Integration benötigt
- 🔄 Auto-Update benötigt

### Twitter/X
- ❌ Komplett neu
- 🔄 API Integration benötigt
- 🔄 Block-Types benötigt

### LinkedIn
- ❌ Komplett neu
- 🔄 API Integration benötigt
- 🔄 Block-Types benötigt

### Instagram
- ❌ Komplett neu
- 🔄 API Integration benötigt
- 🔄 Block-Types benötigt

### Nächste Schritte
1. YouTube API Integration implementieren
2. YouTube Block-Types erweitern
3. Twitter API Integration
4. LinkedIn API Integration
5. Instagram API Integration
6. Kombinierte Social Stats Block

