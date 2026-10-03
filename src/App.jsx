import React, { useState, useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { CommunityProvider } from './context/CommunityContext';
import { DataProvider } from './context/DataContext';
import { useData } from './context/DataContext';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AppRoutes } from './routes/AppRoutes';

import { MembershipModal } from './components/features/membership/MembershipModal';
import { CustomDomainModal } from './components/features/membership/CustomDomainModal';
import { AdminConsoleModal } from './components/features/admin/AdminConsoleModal';

import { membersService } from './services/supabase/membersService';
import { adsService } from './services/supabase/adsService';
import { articlesService } from './services/supabase/articlesService';

function AppLayout() {
  const location = useLocation();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('tfg_theme') || 'light';
  });

  const [showMembershipModal, setShowMembershipModal] =
    useState(false);

  const [showDomainModal, setShowDomainModal] =
    useState(false);

  const [showAdminConsole, setShowAdminConsole] =
    useState(false);

  const [reviewArticles, setReviewArticles] = useState([]);
  const {
    members,
    ads,
    error: dataError,
    setMembers,
    setAds
  } = useData();

  useEffect(() => {
    const loadAppData = async () => {
      try {
        const articlesData =
          await articlesService.getMemberArticles();

        const pendingArticles = (articlesData || []).filter(
          (article) =>
            article.reviewStatus === 'pending' ||
            article.status === 'pending'
        );

        setReviewArticles(pendingArticles);
      } catch (error) {
        console.error(
          'Failed to load application data:',
          error
        );

        setReviewArticles([]);
      }
    };

    loadAppData();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');

      document.body.classList.remove(
        'theme-light',
        'bg-[#FAF8F5]',
        'text-[#121316]'
      );

      document.body.classList.add(
        'theme-dark',
        'bg-[#0B0C0E]',
        'text-zinc-100'
      );
    } else {
      document.documentElement.classList.remove('dark');

      document.body.classList.remove(
        'theme-dark',
        'bg-[#0B0C0E]',
        'text-zinc-100'
      );

      document.body.classList.add(
        'theme-light',
        'bg-[#FAF8F5]',
        'text-[#121316]'
      );
    }

    localStorage.setItem('tfg_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) =>
      prev === 'dark' ? 'light' : 'dark'
    );
  };

  const isDashboardRoute =
    location.pathname.startsWith('/founder/') ||
    location.pathname.startsWith('/admin');

  const currentMember = members[0] || null;

  const handleApproveArticle = async (id) => {
    try {
      await articlesService.updateArticleStatus(
        id,
        'approved',
        ''
      );

      setReviewArticles((prev) =>
        prev.filter((article) => article.id !== id)
      );
    } catch (error) {
      console.error(
        'Failed to approve article:',
        error
      );
    }
  };

  const handleRejectArticle = async (
    id,
    feedback
  ) => {
    try {
      await articlesService.updateArticleStatus(
        id,
        'rejected',
        feedback
      );

      setReviewArticles((prev) =>
        prev.filter((article) => article.id !== id)
      );
    } catch (error) {
      console.error(
        'Failed to reject article:',
        error
      );
    }
  };

  const handleUpdateMemberTier = async (
    id,
    tier
  ) => {
    try {
      const updatedMember =
        await membersService.updateMember(id, {
          membershipTier: tier,
        });

      setMembers((prev) =>
        prev.map((member) =>
          member.id === id
            ? {
                ...member,
                membershipTier: tier,
                ...(updatedMember || {}),
              }
            : member
        )
      );
    } catch (error) {
      console.error(
        'Failed to update member tier:',
        error
      );
    }
  };

  const handleToggleMemberVerification = async (
    id
  ) => {
    try {
      const member = members.find(
        (item) => item.id === id
      );

      if (!member) {
        return;
      }

      const newVerificationStatus =
        !member.isVerified;

      const updatedMember =
        await membersService.updateMember(id, {
          isVerified: newVerificationStatus,
        });

      setMembers((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                isVerified: newVerificationStatus,
                ...(updatedMember || {}),
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        'Failed to update member verification:',
        error
      );
    }
  };

  const handleToggleAdActive = async (id) => {
    if (!id) {
      return;
    }

    try {
      const ad = ads.find(
        (item) => item.id === id
      );

      if (!ad) {
        return;
      }

      await adsService.updateAd({
        ...ad,
        active: !ad.active,
      });

      setAds((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                active: !ad.active,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        'Failed to update advertisement:',
        error
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-200">
      {!isDashboardRoute && (
        <Navbar
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenMembershipModal={() =>
            setShowMembershipModal(true)
          }
          onOpenDomainModal={() =>
            setShowDomainModal(true)
          }
          onOpenAdminConsole={() =>
            setShowAdminConsole(true)
          }
          pendingReviewCount={
            reviewArticles.length
          }
        />
      )}

      {dataError && (
        <div className="bg-rose-950 px-4 py-2 text-center text-xs text-rose-100">
          {dataError}
        </div>
      )}

      <div className="flex-1">
        <AppRoutes />
      </div>

      {!isDashboardRoute && <Footer />}

      {showMembershipModal && (
        <MembershipModal
          isOpen={showMembershipModal}
          onClose={() =>
            setShowMembershipModal(false)
          }
          currentTier={
            currentMember?.membershipTier || 'free'
          }
          onSelectTier={() =>
            setShowMembershipModal(false)
          }
        />
      )}

      {showDomainModal && (
        <CustomDomainModal
          isOpen={showDomainModal}
          onClose={() =>
            setShowDomainModal(false)
          }
          member={currentMember}
          currentDomain={
            currentMember?.subdomain
              ? `${currentMember.subdomain}.thefoundergrid.com`
              : 'thefoundergrid.com'
          }
          onSaveDomain={() =>
            setShowDomainModal(false)
          }
        />
      )}

      {showAdminConsole && (
        <AdminConsoleModal
          isOpen={showAdminConsole}
          onClose={() =>
            setShowAdminConsole(false)
          }
          pendingArticles={reviewArticles}
          members={members}
          ads={ads}
          onApproveArticle={
            handleApproveArticle
          }
          onRejectArticle={
            handleRejectArticle
          }
          onUpdateMemberTier={
            handleUpdateMemberTier
          }
          onToggleMemberVerification={
            handleToggleMemberVerification
          }
          onToggleAdActive={
            handleToggleAdActive
          }
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <CommunityProvider>
            <DataProvider>
              <AppLayout />
            </DataProvider>
          </CommunityProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}