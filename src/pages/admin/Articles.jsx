import React, { useEffect, useState } from 'react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { ArticleReview } from '../../components/admin/ArticleReview';
import { articlesService } from '../../services/supabase/articlesService';

export const Articles = () => {
  const [reviewArticles, setReviewArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);

        const articles =
          await articlesService.getMemberArticles();

        setReviewArticles(articles || []);
      } catch (error) {
        console.error(
          'Failed to load articles:',
          error
        );
        setReviewArticles([]);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  const handleUpdateStatus = async (
    id,
    status,
    feedback
  ) => {
    try {
      await articlesService.updateArticleStatus(
        id,
        status,
        feedback
      );

      setReviewArticles((prev) =>
        prev.map((article) =>
          article.id === id
            ? {
                ...article,
                reviewStatus: status,
                reviewFeedback: feedback,
              }
            : article
        )
      );
    } catch (error) {
      console.error(
        'Failed to update article status:',
        error
      );
    }
  };

  const pendingArticles = reviewArticles.filter(
    (article) =>
      article.reviewStatus === 'pending' ||
      article.status === 'pending'
  );

  return (
    <div className="flex-1 flex max-w-7xl w-full mx-auto py-6">
      <AdminSidebar />

      <main className="flex-1 min-w-0 p-6 sm:p-8 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">
              Loading articles...
            </p>
          </div>
        ) : (
          <ArticleReview
            articles={pendingArticles}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </main>
    </div>
  );
};

export default Articles;