import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT
  ? parseInt(process.env.PORT, 10)
  : 3000;

const distPath = path.resolve(__dirname, 'dist');
const indexPath = path.resolve(distPath, 'index.html');

app.use(express.json());

/*
|--------------------------------------------------------------------------
| Environment variables
|--------------------------------------------------------------------------
*/

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const ALPHA_VANTAGE_API_KEY =
  process.env.ALPHA_VANTAGE_API_KEY;

/*
|--------------------------------------------------------------------------
| Health check
|--------------------------------------------------------------------------
*/

app.get(
  ['/health', '/healthz', '/_health'],
  (_req, res) => {
    res.status(200).send('OK');
  }
);

/*
|--------------------------------------------------------------------------
| NEWS API
|--------------------------------------------------------------------------
|
| React calls:
|
| GET /api/news
|
| Server calls NewsAPI using NEWS_API_KEY.
|
*/

app.get('/api/news', async (_req, res) => {
  try {
    if (!NEWS_API_KEY) {
      return res.status(500).json({
        error: 'NEWS_API_KEY is not configured'
      });
    }

    const url =
      'https://newsapi.org/v2/everything?' +
      new URLSearchParams({
        q: 'business OR finance OR technology OR startup',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: '20',
        apiKey: NEWS_API_KEY
      });

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        'NewsAPI error:',
        response.status,
        errorText
      );

      return res.status(response.status).json({
        error: 'News API request failed'
      });
    }

    const data = await response.json();

    /*
     * Convert NewsAPI format into the format
     * your existing NewsSection.jsx expects.
     */

    const articles = (data.articles || [])
      .filter((article) => article.title)
      .map((article, index) => ({
        id:
          `news-${Date.now()}-${index}`,

        title:
          article.title,

        excerpt:
          article.description ||
          'Read the latest business and technology news.',

        imageUrl:
          article.urlToImage || '',

        category:
          getNewsCategory(
            article.title,
            article.description
          ),

        author: {
          name:
            article.author ||
            article.source?.name ||
            'Editorial Board'
        },

        publishedAt:
          article.publishedAt,

        readTime:
          '4 min read',

        views:
          0,

        isTrending:
          index === 0,

        url:
          article.url,

        source:
          article.source?.name || 'News'
      }));

    res.json({
      articles
    });
  } catch (error) {
    console.error(
      'News endpoint error:',
      error
    );

    res.status(500).json({
      error: 'Unable to fetch news'
    });
  }
});

/*
|--------------------------------------------------------------------------
| NEWS CATEGORY HELPER
|--------------------------------------------------------------------------
*/

function getNewsCategory(title = '', description = '') {
  const text =
    `${title} ${description}`.toLowerCase();

  if (
    text.includes('startup') ||
    text.includes('venture') ||
    text.includes('funding') ||
    text.includes('investment')
  ) {
    return 'Venture Capital';
  }

  if (
    text.includes('stock') ||
    text.includes('market') ||
    text.includes('finance') ||
    text.includes('bank') ||
    text.includes('investor')
  ) {
    return 'Finance';
  }

  if (
    text.includes('ai') ||
    text.includes('artificial intelligence') ||
    text.includes('technology') ||
    text.includes('software') ||
    text.includes('tech')
  ) {
    return 'Tech/AI';
  }

  if (
    text.includes('economy') ||
    text.includes('inflation') ||
    text.includes('gdp') ||
    text.includes('fed') ||
    text.includes('interest rate')
  ) {
    return 'Macro Economy';
  }

  if (
    text.includes('founder') ||
    text.includes('entrepreneur') ||
    text.includes('ceo')
  ) {
    return 'Founders';
  }

  return 'Business';
}

/*
|--------------------------------------------------------------------------
| STOCK MARKET API
|--------------------------------------------------------------------------
|
| React calls:
|
| GET /api/stocks
|
| Server calls Alpha Vantage.
|
*/

app.get('/api/stocks', async (_req, res) => {
  try {
    if (!ALPHA_VANTAGE_API_KEY) {
      return res.status(500).json({
        error:
          'ALPHA_VANTAGE_API_KEY is not configured'
      });
    }

    /*
     * Stocks you want to display.
     *
     * You can change these later.
     */

    const symbols = [
      'AAPL',
      'MSFT',
      'GOOGL',
      'AMZN',
      'TSLA'
    ];

    const tickers = [];

    /*
     * Alpha Vantage free usage has rate limits,
     * so we request the symbols one by one.
     */

    for (const symbol of symbols) {
      const url =
        'https://www.alphavantage.co/query?' +
        new URLSearchParams({
          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: ALPHA_VANTAGE_API_KEY
        });

      const response = await fetch(url);

      if (!response.ok) {
        console.error(
          `Alpha Vantage failed for ${symbol}`
        );

        continue;
      }

      const data = await response.json();

      const quote =
        data['Global Quote'];

      if (!quote || !quote['05. price']) {
        console.warn(
          `No stock data returned for ${symbol}`,
          data
        );

        continue;
      }

      const price =
        Number(quote['05. price']);

      const change =
        Number(quote['09. change']);

      const changePercent =
        parseFloat(
          String(
            quote['10. change percent'] || '0'
          ).replace('%', '')
        );

      tickers.push({
        id: symbol,

        symbol,

        name: getCompanyName(symbol),

        price,

        change,

        changePercent,

        positive:
          change >= 0
      });
    }

    res.json({
      tickers
    });
  } catch (error) {
    console.error(
      'Stock endpoint error:',
      error
    );

    res.status(500).json({
      error:
        'Unable to fetch stock market data'
    });
  }
});

/*
|--------------------------------------------------------------------------
| COMPANY NAMES
|--------------------------------------------------------------------------
*/

function getCompanyName(symbol) {
  const companies = {
    AAPL: 'Apple',
    MSFT: 'Microsoft',
    GOOGL: 'Alphabet',
    AMZN: 'Amazon',
    TSLA: 'Tesla'
  };

  return (
    companies[symbol] || symbol
  );
}

/*
|--------------------------------------------------------------------------
| Serve Vite production build
|--------------------------------------------------------------------------
*/

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

/*
|--------------------------------------------------------------------------
| SPA fallback
|--------------------------------------------------------------------------
*/

app.get('*', (_req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res
      .status(200)
      .send(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>The Founder Grid</title>
          </head>

          <body
            style="
              background:#0a0a0a;
              color:#fff;
              font-family:sans-serif;
              display:flex;
              align-items:center;
              justify-content:center;
              height:100vh;
            "
          >
            <div>
              Loading The Founder Grid...
            </div>
          </body>
        </html>
      `);
  }
});


// | Start server


const server = app.listen(
  PORT,
  '0.0.0.0',
  () => {
    console.log(
      `Server listening on http://0.0.0.0:${PORT}`
    );
  }
);

/*
|Graceful shutdown
*/

process.on('SIGTERM', () => {
  console.log(
    'SIGTERM signal received: closing HTTP server'
  );

  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  server.close(() => {
    process.exit(0);
  });
});
