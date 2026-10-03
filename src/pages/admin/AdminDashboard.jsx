import React, { useEffect, useState } from 'react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { SupabaseStatusCard } from '../../components/features/admin/SupabaseStatusCard';
import { ArticleReview } from '../../components/admin/ArticleReview';
import { MemberManagement } from '../../components/admin/MemberManagement';
import {
  ShieldCheck,
  FileCheck,
  Users,
  TrendingUp,
} from 'lucide-react';
import { membersService } from '../../services/supabase/membersService';
import { articlesService } from '../../services/supabase/articlesService';

export const AdminDashboard = () => {
  const [members, setMembers] = useState([]);
  const [reviewArticles, setReviewArticles] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoadingMembers(true);

        const data = await membersService.getAllMembers();

        setMembers(data || []);
      } catch (error) {
        console.error('Failed to load members:', error);
        setMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    };

    loadMembers();
  }, []);

  useEffect(() => {
    const loadReviewArticles = async () => {
      try {
        setLoadingArticles(true);

        const articles =
          await articlesService.getMemberArticles();

        const pending = (articles || []).filter(
          (article) =>
            article.reviewStatus === 'pending' ||
            article.status === 'pending'
        );

        setReviewArticles(pending);
      } catch (error) {
        console.error(
          'Failed to load review articles:',
          error
        );
        setReviewArticles([]);
      } finally {
        setLoadingArticles(false);
      }
    };

    loadReviewArticles();
  }, []);

  const handleUpdateMember = async (id, updates) => {
    try {
      const updatedMember =
        await membersService.updateMember(id, updates);

      setMembers((prev) =>
        prev.map((member) =>
          member.id === id
            ? {
                ...member,
                ...updates,
                ...(updatedMember || {}),
              }
            : member
        )
      );
    } catch (error) {
      console.error(
        'Failed to update member:',
        error
      );
    }
  };

  const handleUpdateArticleStatus = async (
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
        prev.filter((article) => article.id !== id)
      );
    } catch (error) {
      console.error(
        'Failed to update article status:',
        error
      );
    }
  };

  return (
    <div className="flex-1 flex max-w-7xl w-full mx-auto py-6">
      <AdminSidebar />

      <main className="flex-1 min-w-0 p-6 sm:p-8 space-y-8">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Syndicate Governance & Editorial Board
          </h1>

          <p className="text-xs text-zinc-500 mt-1">
            Supervise editorial submissions, verification
            standards, and publication subdomains.
          </p>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[10px] uppercase font-mono">
                Members
              </span>
              <Users className="w-4 h-4 text-amber-500" />
            </div>

            <div className="font-serif text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {loadingMembers ? '...' : members.length}
            </div>

            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              Active Vetted
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[10px] uppercase font-mono">
                Review Queue
              </span>

              <FileCheck className="w-4 h-4 text-rose-500" />
            </div>

            <div className="font-serif text-2xl font-bold text-rose-600">
              {loadingArticles
                ? '...'
                : reviewArticles.length}
            </div>

            <div className="text-[11px] text-zinc-500 mt-1">
              Pending syndication
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[10px] uppercase font-mono">
                Subdomains
              </span>

              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>

            <div className="font-serif text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {members.length}
            </div>

            <div className="text-[11px] text-amber-600 font-semibold mt-1">
              Active Member Profiles
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[10px] uppercase font-mono">
                Verification
              </span>

              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>

            <div className="font-serif text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {members.length > 0
                ? Math.round(
                    (members.filter(
                      (member) => member.isVerified
                    ).length /
                      members.length) *
                      100
                  )
                : 0}
              %
            </div>

            <div className="text-[11px] text-zinc-500 mt-1">
              Verified Members
            </div>
          </div>
        </div>

        {/* Supabase Integration Status */}
        <SupabaseStatusCard />

        {/* Pending Article Reviews */}
        <ArticleReview
          articles={reviewArticles}
          onUpdateStatus={handleUpdateArticleStatus}
        />

        {/* Member Management */}
        <MemberManagement
          members={members}
          onUpdateMember={handleUpdateMember}
        />
      </main>
    </div>
  );
};

export default AdminDashboard;