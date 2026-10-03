import React, { useState } from 'react';
import { Hero } from '../components/home/Hero';
import { StockTicker } from '../components/home/StockTicker';
import { AdBanner } from '../components/home/AdBanner';
import { NewsSection } from '../components/home/NewsSection';
import { FeaturedFounders } from '../components/home/FeaturedFounders';
import { MemberDirectory } from '../components/home/MemberDirectory';
import { ArticleDetailModal } from '../components/features/news/ArticleDetailModal';
import { CustomPortfolioModal } from '../components/features/community/CustomPortfolioModal';
import { MembershipModal } from '../components/features/membership/MembershipModal';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../context/DataContext';

export const Home = () => {
  const [selectedArticle, setSelectedArticle] =
    useState(null);

  const [selectedMember, setSelectedMember] =
    useState(null);

  const [showMembershipModal, setShowMembershipModal] =
    useState(false);

  const auth = useAuth();

  // Members now come from Supabase through DataContext
  const { members } = useData();

  return (
    <div className="space-y-6">

      {/* Financial Stock Ticker */}
      <StockTicker />

      {/* Leaderboard Ad */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdBanner slot="top_leaderboard" />
      </div>

      {/* Editorial Hero */}
      <Hero
        onOpenMembershipModal={() =>
          setShowMembershipModal(true)
        }
      />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Daily Intelligence & News Feed */}
        <NewsSection
          onSelectArticle={(article) =>
            setSelectedArticle(article)
          }
        />

        {/* Mid-page In-Feed Sponsor Banner */}
        <AdBanner slot="in_feed_home" />

        {/* Featured Founder Spotlight */}
        <FeaturedFounders
          onOpenPortfolio={(member) =>
            setSelectedMember(member)
          }
        />

        {/* Member Directory Quick View */}
        <MemberDirectory
          onOpenPortfolio={(member) =>
            setSelectedMember(member)
          }
        />
      </div>

      {/* Article Modal */}
      {selectedArticle && (
        <ArticleDetailModal
          article={selectedArticle}
          isOpen={!!selectedArticle}
          onClose={() =>
            setSelectedArticle(null)
          }
          members={members}
          onOpenSubdomain={() => {}}
        />
      )}

      {/* Portfolio Modal */}
      {selectedMember && (
        <CustomPortfolioModal
          member={selectedMember}
          isOpen={!!selectedMember}
          onClose={() =>
            setSelectedMember(null)
          }
        />
      )}

      {/* Membership Modal */}
      {showMembershipModal && (
        <MembershipModal
          isOpen={showMembershipModal}
          onClose={() =>
            setShowMembershipModal(false)
          }
          currentTier={
            auth?.user?.tier || 'founder_pro'
          }
          onSelectTier={(tier) => {
            auth?.updateUser({ tier });
            setShowMembershipModal(false);
          }}
        />
      )}

    </div>
  );
};

export default Home;