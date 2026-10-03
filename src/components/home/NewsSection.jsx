import React, { useEffect, useState } from 'react';
import { Flame, Eye, ArrowRight } from 'lucide-react';
import { ARTICLE_CATEGORIES } from '../../utils/constants';

export const NewsSection = ({ onSelectArticle }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load news from our backend
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/news');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `News API request failed: ${response.status}`);
        }

        setArticles(Array.isArray(data.articles) ? data.articles : []);
      } catch (err) {
        console.error('Failed to load news:', err);
        setError('Unable to load news right now.');
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Filter articles according to selected category
  const filteredArticles = articles.filter((article) => {
    if (selectedCategory === 'All') {
      return true;
    }

    return article.category === selectedCategory;
  });

  const featured =
    filteredArticles[0] || articles[0] || null;

  const sideArticles = filteredArticles.slice(1, 5);

  return (
    <section className="py-8">

      {/* Category Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-6 overflow-x-auto gap-2">
        <div className="flex items-center gap-1.5 min-w-max">

  {['All', ...ARTICLE_CATEGORIES.filter((c) => c !== 'All').slice(0, 7)].map(
    (category) => (
      <button
        key={category}
        onClick={() => setSelectedCategory(category)}
        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
          selectedCategory === category
            ? 'bg-zinc-900 text-white dark:bg-amber-500 dark:text-zinc-950 font-bold'
            : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
        }`}
      >
        {category}
      </button>
    )
       )}

        </div>

        <span className="hidden sm:block text-[11px] font-mono text-zinc-400">
          DAILY EDITORIAL DESK
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

          {/* Main skeleton */}
          <div className="lg:col-span-8 h-[450px] rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />

          {/* Side skeletons */}
          <div className="lg:col-span-4 space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-20 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse"
              />
            ))}
          </div>

        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="py-12 text-center">
          <p className="text-red-500 dark:text-red-400 text-sm">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm font-semibold rounded-lg bg-zinc-900 text-white dark:bg-amber-500 dark:text-zinc-950 hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      )}

      {/* No Articles */}
      {!loading && !error && !featured && (
        <div className="py-12 text-center text-zinc-500 dark:text-zinc-400">
          No articles found.
        </div>
      )}

      {/* News Content */}
      {!loading && !error && featured && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

          {/* Main Featured Article */}
          <div
            onClick={() =>
              onSelectArticle &&
              onSelectArticle(featured)
            }
            className="lg:col-span-8 group cursor-pointer rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:border-amber-500/50 transition-all"
          >

            {/* Image */}
            <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">

              {featured.imageUrl ? (
                <img
                  src={featured.imageUrl}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                  No image available
                </div>
              )}

              {/* Category + Trending */}
              <div className="absolute top-4 left-4 flex items-center gap-2">

                <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-black/80 text-amber-400 backdrop-blur-xs rounded-md">
                  {featured.category || 'News'}
                </span>

                {featured.isTrending && (
                  <span className="px-2 py-1 text-[11px] font-semibold bg-rose-600 text-white rounded-md flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    Breaking
                  </span>
                )}

              </div>
            </div>

            {/* Article Information */}
            <div className="p-6">

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-100 group-hover:text-amber-600 transition-colors leading-snug">
                {featured.title}
              </h2>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2">
                {featured.excerpt || 'Read the latest news and updates.'}
              </p>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500">

                {/* Author */}
                <div className="flex items-center gap-2">

                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                    {featured.author?.name ||
                      featured.author ||
                      'Editorial Board'}
                  </span>

                  <span>•</span>

                  <span>
                    {featured.readTime || '4 min read'}
                  </span>

                </div>

                {/* Views + Read Story */}
                <div className="flex items-center gap-3">

                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {featured.views || 0}
                  </span>

                  <span className="text-amber-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Read Story
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>

                </div>

              </div>
            </div>
          </div>

          {/* Secondary Articles */}
          <div className="lg:col-span-4 flex flex-col gap-4 text-[#6B4925] dark:text-[#D6B38A]">

            <div className="flex items-center justify-between pb-3 border-b-2 border-[#B8895A]/40 dark:border-[#D6B38A]/40">
              <h3 className="text-sm sm:text-base font-black uppercase tracking-[0.12em] text-[#4A3328] dark:text-[#E8C9A2]">
              Top Executive Intelligence
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#855E31] dark:text-[#C79B68]">Briefing</span>
            </div>

            <div className="divide-y divide-[#D9C3A8] dark:divide-[#6B4925]">

              {sideArticles.map((article) => {

                const authorName =
                  article.author?.name ||
                  article.author ||
                  'Staff Writer';

                const publishDate =
                  article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString()
                    : 'Recent';

                return (
                  <div
                    key={article.id}
                    onClick={() =>
                      onSelectArticle &&
                      onSelectArticle(article)
                    }
                    className="py-4 first:pt-0 last:pb-0 group cursor-pointer"
                  >

                    {/* Category */}
                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wide text-[#855E31] dark:text-[#C79B68] mb-1.5">

                      <span>
                        {article.category || 'News'}
                      </span>

                      <span>•</span>

                      <span>
                        {article.readTime || '3 min read'}
                      </span>

                    </div>

                    {/* Title */}
                    <h4 className="font-serif text-[15px] font-extrabold text-[#4A3328] dark:text-[#E8C9A2] line-clamp-2 leading-snug">
                      {article.title}
                    </h4>

                    {/* Author + Date */}
                    <div className="flex items-center gap-2 mt-2 text-[11px] font-medium text-[#855E31] dark:text-[#C79B68]">

                      <span>
                        {authorName}
                      </span>

                      <span>•</span>

                      <span>
                        {publishDate}
                      </span>

                    </div>

                  </div>
                );
              })}

            </div>
          </div>

        </div>
      )}

    </section>
  );
};

export default NewsSection;