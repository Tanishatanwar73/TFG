import 'dotenv/config';

const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';

export async function getNewsArticles() {
  const apiKey = process.env.NEWS_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('NEWS_API_KEY is not configured on the server');
  }

  const url = new URL(NEWS_API_URL);
  url.searchParams.set('language', 'en');
  url.searchParams.set('pageSize', '12');
  url.searchParams.set('category', 'business');
  url.searchParams.set('apiKey', apiKey);

  const response = await fetch(url, {
    signal: AbortSignal.timeout(10000),
  });
  const data = await response.json();

  if (!response.ok || data.status !== 'ok') {
    throw new Error(data.message || `News API request failed: ${response.status}`);
  }

  return (data.articles || []).map((article: any, index: number) => ({
    id: article.url || `news-${index}`,
    title: article.title || 'Untitled business story',
    slug: undefined,
    category: 'Macro Economy',
    excerpt: article.description || 'Read the latest business and market intelligence.',
    content: article.content || article.description || '',
    author: {
      name: article.author || article.source?.name || 'Editorial Desk',
      role: 'Business News',
      avatar: '',
      isVerifiedFounder: false,
      isAdmin: false,
    },
    publishedAt: article.publishedAt || new Date().toISOString(),
    readTime: '4 min read',
    views: 0,
    imageUrl: article.urlToImage || '',
    keyTakeaways: [],
    isLeadEditorial: index === 0,
    isFeatured: index === 0,
    isTrending: false,
    tags: ['Business', 'Markets'],
    url: article.url,
  }));
}
