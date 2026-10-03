import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

import {
  Sparkles,
  Send,
  Eye,
  FileText,
  CheckCircle2,
  ChevronDown,
  Check,
  Briefcase,
  Cpu,
  TrendingUp,
  Rocket,
  Users,
} from 'lucide-react';

import { requestAIGenerateArticle } from '../../services/aiArticleService';
import articleService from '../../services/articleService';
import { useAuth } from '../../hooks/useAuth';

export const CreateArticle = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Business');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [published, setPublished] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  // ==========================================
  // CATEGORIES
  // ==========================================

  const categories = [
    {
      name: 'Business',
      description: 'Business and companies',
      icon: Briefcase,
      iconClass:
        'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    },
    {
      name: 'Technology',
      description: 'Technology and innovation',
      icon: Cpu,
      iconClass:
        'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    },
    {
      name: 'Finance',
      description: 'Markets and finance',
      icon: TrendingUp,
      iconClass:
        'bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400',
    },
    {
      name: 'Startup',
      description: 'Startups and entrepreneurship',
      icon: Rocket,
      iconClass:
        'bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
    },
    {
      name: 'Leadership',
      description: 'Leadership and management',
      icon: Users,
      iconClass:
        'bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
    },
  ];

  const selectedCategory =
    categories.find((item) => item.name === category) ||
    categories[0];

  const SelectedIcon = selectedCategory.icon;

  // ==========================================
  // AI ARTICLE GENERATION
  // ==========================================

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      alert('Please enter a topic for the AI article.');
      return;
    }

    setIsGenerating(true);

    try {
      const res = await requestAIGenerateArticle({
        topic: aiPrompt,
        category,
        authorName:
          auth.user?.name || 'Executive Author',
        authorCompany:
          auth.user?.company || 'Enterprise Venture',
      });

      if (res) {
        if (res.title) {
          setTitle(res.title);
        }

        if (res.content) {
          setContent(res.content);
        }

        if (res.summary) {
          setSummary(res.summary);
        }
      }
    } catch (error) {
      console.error('AI generation error:', error);

      alert(
        'Failed to generate article with AI.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // ==========================================
  // PUBLISH ARTICLE
  // ==========================================

  const handlePublish = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter an article title.');
      return;
    }

    if (!content.trim()) {
      alert('Please enter article content.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newArticle = {
        title: title.trim(),

        category,

        content: content.trim(),

        summary:
          summary.trim() ||
          content.trim().slice(0, 150) + '...',

        author:
          auth.user?.name || 'Executive Author',

        authorSubdomain:
          auth.user?.subdomain || '',

        date: new Date().toISOString(),

        views: 0,

        status: 'published',
      };

      console.log(
        'Saving article to Supabase:',
        newArticle
      );

      const savedArticle =
        await articleService.createArticle(
          newArticle
        );

      console.log(
        'Article saved:',
        savedArticle
      );

      if (
        savedArticle === false ||
        savedArticle?.success === false ||
        !savedArticle
      ) {
        throw new Error(
          savedArticle?.error ||
            'Failed to save article to Supabase.'
        );
      }

      // Update local user information

      const updatedUser = {
        ...auth.user,

        publishedArticlesCount:
          (auth.user?.publishedArticlesCount || 0) +
          1,

        quotaUsed:
          (auth.user?.quotaUsed || 0) + 1,

        articles: [
          newArticle,
          ...(Array.isArray(auth.user?.articles)
            ? auth.user.articles
            : []),
        ],
      };

      if (auth.updateUser) {
        auth.updateUser(updatedUser);
      }

      // Show success message

      setPublished(true);

      // Go to articles page

      setTimeout(() => {
        navigate('/founder/articles');
      }, 1200);
    } catch (error) {
      console.error(
        'Failed to publish article:',
        error
      );

      alert(
        error?.message ||
          'Failed to publish article. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <DashboardLayout
      title="Editorial Composer & AI Co-Author"
      subtitle={`Authoring for ${
        auth.user?.subdomain || 'founder'
      }.thefoundergrid.com`}
    >
      <div className="mx-auto max-w-5xl space-y-6">

        {/* =====================================
            SUCCESS MESSAGE
        ===================================== */}

        {published && (
          <div
            className="
              flex items-center gap-3
              rounded-xl
              border border-green-200
              bg-green-50
              p-4
              text-green-700
              dark:border-green-900
              dark:bg-green-950/30
              dark:text-green-400
            "
          >
            <CheckCircle2 size={22} />

            <div>
              <p className="font-semibold">
                Article published successfully!
              </p>

              <p className="text-sm">
                Your article has been saved to Supabase.
              </p>
            </div>
          </div>
        )}

        {/* =====================================
            AI CO-AUTHOR
        ===================================== */}

        <div
          className="
            rounded-2xl
            border border-zinc-200
            bg-white
            p-6
            shadow-sm
            dark:border-zinc-800
            dark:bg-zinc-900
          "
        >
          <div className="mb-5 flex items-center gap-3">

            <div
              className="
                rounded-xl
                bg-purple-100
                p-3
                dark:bg-purple-950/40
              "
            >
              <Sparkles
                size={21}
                className="text-purple-600"
              />
            </div>

            <div>
              <h2
                className="
                  text-lg
                  font-semibold
                  text-zinc-900
                  dark:text-zinc-100
                "
              >
                AI Co-Author
              </h2>

              <p
                className="
                  text-sm
                  text-zinc-500
                  dark:text-zinc-400
                "
              >
                Generate an article using AI.
              </p>
            </div>

          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            <div className="flex-1">
              <Input
                value={aiPrompt}
                onChange={(e) =>
                  setAiPrompt(e.target.value)
                }
                placeholder="Enter a topic for your article..."
              />
            </div>

            <Button
              type="button"
              variant="gold"
              icon={Sparkles}
              loading={isGenerating}
              onClick={handleAiGenerate}
            >
              Generate
            </Button>

          </div>
        </div>

        {/* =====================================
            ARTICLE FORM
        ===================================== */}

        <form
          onSubmit={handlePublish}
          className="space-y-6"
        >

          <div
            className="
              rounded-2xl
              border border-zinc-200
              bg-white
              p-6
              shadow-sm
              dark:border-zinc-800
              dark:bg-zinc-900
            "
          >

            {/* =================================
                TITLE
            ================================= */}

            <div className="mb-6">

              <label
                htmlFor="article-title"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-zinc-900
                  dark:text-zinc-100
                "
              >
                Article Title
              </label>

              <Input
                id="article-title"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Enter article title"
              />

            </div>

            {/* =================================
                CATEGORY
            ================================= */}

            <div className="mb-6">

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-zinc-900
                  dark:text-zinc-100
                "
              >
                Category
              </label>

              <div className="relative">

                {/* SELECTED CATEGORY */}

                <button
                  type="button"
                  onClick={() =>
                    setCategoryOpen(
                      !categoryOpen
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-xl
                    border
                    border-zinc-300
                    bg-white
                    px-4
                    py-3
                    text-left
                    transition-all
                    hover:border-amber-400
                    focus:border-amber-500
                    focus:outline-none
                    focus:ring-2
                    focus:ring-amber-500/10
                    dark:border-zinc-700
                    dark:bg-zinc-900
                  "
                >

                  <div className="flex items-center gap-3">

                    <div
                      className={`
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-lg
                        ${selectedCategory.iconClass}
                      `}
                    >
                      <SelectedIcon size={18} />
                    </div>

                    <div>

                      <p
                        className="
                          text-sm
                          font-semibold
                          text-zinc-900
                          dark:text-zinc-100
                        "
                      >
                        {category}
                      </p>

                      <p
                        className="
                          text-xs
                          text-zinc-500
                          dark:text-zinc-400
                        "
                      >
                        {selectedCategory.description}
                      </p>

                    </div>

                  </div>

                  <ChevronDown
                    size={19}
                    className={`
                      text-zinc-500
                      transition-transform
                      ${
                        categoryOpen
                          ? 'rotate-180'
                          : ''
                      }
                    `}
                  />

                </button>

                {/* CATEGORY DROPDOWN */}

                {categoryOpen && (
                  <div
                    className="
                      absolute
                      left-0
                      right-0
                      z-50
                      mt-2
                      overflow-hidden
                      rounded-xl
                      border
                      border-zinc-200
                      bg-white
                      p-2
                      shadow-2xl
                      dark:border-zinc-700
                      dark:bg-zinc-900
                    "
                  >

                    {categories.map((item) => {
                      const Icon = item.icon;

                      const isSelected =
                        category === item.name;

                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => {
                            setCategory(
                              item.name
                            );

                            setCategoryOpen(
                              false
                            );
                          }}
                          className={`
                            flex
                            w-full
                            items-center
                            justify-between
                            rounded-lg
                            px-3
                            py-3
                            text-left
                            transition-all
                            ${
                              isSelected
                                ? 'bg-amber-50 dark:bg-amber-950/30'
                                : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                            }
                          `}
                        >

                          <div className="flex items-center gap-3">

                            <div
                              className={`
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg
                                ${item.iconClass}
                              `}
                            >
                              <Icon size={17} />
                            </div>

                            <div>

                              <p
                                className="
                                  text-sm
                                  font-semibold
                                  text-zinc-900
                                  dark:text-zinc-100
                                "
                              >
                                {item.name}
                              </p>

                              <p
                                className="
                                  text-xs
                                  text-zinc-500
                                  dark:text-zinc-400
                                "
                              >
                                {item.description}
                              </p>

                            </div>

                          </div>

                          {isSelected && (
                            <div
                              className="
                                flex
                                h-6
                                w-6
                                items-center
                                justify-center
                                rounded-full
                                bg-amber-500
                                text-white
                              "
                            >
                              <Check size={14} />
                            </div>
                          )}

                        </button>
                      );
                    })}

                  </div>
                )}

              </div>
            </div>

            {/* =================================
                SUMMARY
            ================================= */}

            <div className="mb-6">

              <label
                htmlFor="article-summary"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-zinc-900
                  dark:text-zinc-100
                "
              >
                Summary
              </label>

              <textarea
                id="article-summary"
                value={summary}
                onChange={(e) =>
                  setSummary(e.target.value)
                }
                placeholder="Write a short summary..."
                rows={4}
                className="
                  w-full
                  resize-y
                  rounded-xl
                  border
                  border-zinc-300
                  bg-white
                  px-4
                  py-3
                  text-sm
                  leading-6
                  text-zinc-900
                  placeholder:text-zinc-400
                  outline-none
                  transition
                  focus:border-amber-500
                  focus:ring-2
                  focus:ring-amber-500/10
                  dark:border-zinc-700
                  dark:bg-zinc-900
                  dark:text-zinc-100
                  dark:placeholder:text-zinc-500
                "
              />

            </div>

            {/* =================================
                ARTICLE CONTENT
            ================================= */}

            <div>

              <label
                htmlFor="article-content"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-zinc-900
                  dark:text-zinc-100
                "
              >
                Article Content
              </label>

              <div
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-zinc-300
                  bg-white
                  shadow-sm
                  transition
                  focus-within:border-amber-500
                  focus-within:ring-2
                  focus-within:ring-amber-500/10
                  dark:border-zinc-700
                  dark:bg-zinc-900
                "
              >

                <textarea
                  id="article-content"
                  value={content}
                  onChange={(e) =>
                    setContent(e.target.value)
                  }
                  placeholder="Write your article here..."
                  className="
                    min-h-[450px]
                    w-full
                    resize-y
                    border-0
                    bg-white
                    px-5
                    py-5
                    text-base
                    leading-7
                    text-zinc-900
                    placeholder:text-zinc-400
                    outline-none
                    focus:ring-0
                    dark:bg-zinc-900
                    dark:text-zinc-100
                    dark:placeholder:text-zinc-500
                  "
                />

              </div>

            </div>

          </div>

          {/* =====================================
              ACTION BUTTONS
          ===================================== */}

          <div
            className="
              flex
              flex-col
              gap-3
              rounded-2xl
              border
              border-zinc-200
              bg-white
              p-5
              shadow-sm
              sm:flex-row
              sm:items-center
              sm:justify-between
              dark:border-zinc-800
              dark:bg-zinc-900
            "
          >

            <Button
              type="button"
              variant="outline"
              icon={Eye}
              onClick={() =>
                alert(
                  'Preview functionality can be added here.'
                )
              }
            >
              Preview
            </Button>

            <Button
              type="submit"
              variant="gold"
              size="md"
              icon={Send}
              loading={isSubmitting}
            >
              Publish to Subdomain
            </Button>

          </div>

        </form>

        {/* =====================================
            PUBLISHING INFO
        ===================================== */}

        <div
          className="
            flex
            items-start
            gap-3
            rounded-xl
            border
            border-zinc-200
            bg-zinc-50
            p-4
            dark:border-zinc-800
            dark:bg-zinc-900/60
          "
        >

          <FileText
            size={20}
            className="
              mt-1
              text-zinc-500
              dark:text-zinc-400
            "
          />

          <div>

            <p
              className="
                font-semibold
                text-zinc-800
                dark:text-zinc-200
              "
            >
              Publishing
            </p>

            <p
              className="
                mt-1
                text-sm
                leading-6
                text-zinc-500
                dark:text-zinc-400
              "
            >
              Your article will be saved to
              Supabase and published under your
              founder subdomain.
            </p>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default CreateArticle;