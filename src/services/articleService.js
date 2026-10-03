import { articlesService as supabaseArticlesService } from './supabase/articlesService';
import { requestAIGenerateArticle } from './aiArticleService';

export const articleService = {
  async getNewsArticles(category = 'All') {
    try {
      const articles =
        await supabaseArticlesService.getNewsArticles();

      const live = articles || [];

      if (category === 'All') {
        return live;
      }

      return live.filter(
        (article) => article.category === category
      );
    } catch (error) {
      console.error(
        'Failed to fetch news articles from Supabase:',
        error
      );

      return [];
    }
  },

  async getArticleById(id) {
    const articles = await this.getNewsArticles('All');

    return (
      articles.find((article) => article.id === id) ||
      null
    );
  },

  async getAllMemberArticles() {
    try {
      const articles =
        await supabaseArticlesService.getMemberArticles();

      return articles || [];
    } catch (error) {
      console.error(
        'Failed to fetch member articles from Supabase:',
        error
      );

      return [];
    }
  },

  async getArticlesByMember(subdomain) {
    const articles = await this.getAllMemberArticles();

    return articles.filter(
      (article) => article.authorSubdomain === subdomain
    );
  },

  async createArticle(articleData) {
    try {
      const newArticle = {
        ...articleData,
        views: articleData.views || 0,
        status: articleData.status || 'published',
      };

      const createdArticle =
        await supabaseArticlesService.createMemberArticle(
          newArticle
        );

      return createdArticle || newArticle;
    } catch (error) {
      console.error(
        'Failed to create article in Supabase:',
        error
      );

      return {
        success: false,
        error:
          error.message || 'Failed to create article',
      };
    }
  },

  async updateArticleStatus(
    id,
    status,
    feedback = ''
  ) {
    try {
      const result =
        await supabaseArticlesService.updateArticleStatus(
          id,
          status,
          feedback
        );

      return (
        result || {
          success: true,
          id,
          status,
          feedback,
        }
      );
    } catch (error) {
      console.error(
        'Failed to update article status:',
        error
      );

      return {
        success: false,
        id,
        status,
        feedback,
        error:
          error.message ||
          'Failed to update article status',
      };
    }
  },

  async generateWithAI(promptParams) {
    return await requestAIGenerateArticle(
      promptParams
    );
  },
};

export default articleService;