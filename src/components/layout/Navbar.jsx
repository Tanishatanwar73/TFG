import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import {
  Newspaper,
  Users,
  MessageSquare,
  Globe,
  ShieldCheck,
  Crown,
  ChevronDown,
  Briefcase,
  LogOut,
  User,
  Sun,
  Moon,
} from 'lucide-react';

import { FounderGridLogo } from '../common/FounderGridLogo';
import { useAuth } from '../../hooks/useAuth';

export const Navbar = ({
  currentTab,
  onSelectTab,
  currentUser,
  isPaidMember,
  onToggleMembershipState,
  onOpenMembershipModal,
  onOpenDomainModal,
  onOpenPortfolio,
  onOpenCredentialPack,
  onOpenAdminConsole,
  pendingReviewCount = 0,
  theme = 'light',
  onToggleTheme,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  const user = currentUser || auth?.user;

  const isPaid =
    isPaidMember !== undefined
      ? isPaidMember
      : auth?.isPaidMember;

  const navLinks = [
    {
      id: 'news',
      path: '/',
      label: 'The Wire & Intelligence',
      icon: Newspaper,
    },
    {
      id: 'directory',
      path: '/directory',
      label: 'Member Directory',
      icon: Users,
    },
    {
      id: 'community',
      path: '/community',
      label: 'Founder Exchange',
      icon: MessageSquare,
    },
    {
      id: 'studio',
      path: '/founder/dashboard',
      label: 'Editorial Studio',
      icon: Globe,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md">

      <div className="w-full flex h-20 items-center px-4 sm:px-6 lg:px-8">

        {/* =========================================
            LEFT - LOGO
        ========================================= */}

        <div className="flex-shrink-0">
          <Link
            to="/"
            className="flex items-center focus:outline-none"
          >
            <FounderGridLogo
              variant="full"
              size="md"
            />
          </Link>
        </div>


        {/* =========================================
            CENTER - NAVIGATION
        ========================================= */}

        <nav className="hidden md:flex flex-1 items-center justify-center gap-1">

          {navLinks.map((item) => {
            const Icon = item.icon;

            const isActive =
              location.pathname === item.path ||
              (
                item.path !== '/' &&
                location.pathname.startsWith(item.path)
              ) ||
              currentTab === item.id;

            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() =>
                  onSelectTab &&
                  onSelectTab(item.id)
                }
                className={`
                  flex items-center gap-2
                  px-4 py-2.5
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  rounded-lg
                  transition-colors
                  ${
                    isActive
                      ? 'bg-zinc-800 text-white font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5 text-amber-500" />

                <span>
                  {item.label}
                </span>
              </Link>
            );
          })}

        </nav>


        {/* =========================================
            RIGHT - MEMBER / ADMIN / THEME
        ========================================= */}

        <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">

          {/* ADMIN */}

          {(user?.role === 'Admin' ||
            user?.subdomain === 'elenavance' ||
            onOpenAdminConsole) && (
            <button
              onClick={() =>
                onOpenAdminConsole
                  ? onOpenAdminConsole()
                  : navigate('/admin')
              }
              className="
                hidden lg:flex
                items-center gap-1.5
                px-2.5 py-1.5
                text-xs
                font-bold
                uppercase
                tracking-wider
                text-rose-400
                bg-rose-950/40
                rounded-lg
                border border-rose-900/60
                hover:bg-rose-900/50
                transition-colors
                cursor-pointer
              "
              title="Admin Moderation Console"
            >
              <ShieldCheck className="w-3.5 h-3.5" />

              <span>Admin</span>

              {pendingReviewCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-rose-600 text-white font-mono">
                  {pendingReviewCount}
                </span>
              )}
            </button>
          )}


          {/* THEME */}

          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="
                p-2
                text-zinc-400
                hover:text-white
                rounded-lg
                hover:bg-zinc-800
                transition-colors
                cursor-pointer
              "
              title={
                `Switch to ${
                  theme === 'dark'
                    ? 'Light'
                    : 'Executive Dark'
                } mode`
              }
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          )}


          {/* =====================================
              MEMBER PROFILE
          ===================================== */}

          {user ? (
            <div className="relative">

              <button
                onClick={() =>
                  setIsUserMenuOpen(
                    !isUserMenuOpen
                  )
                }
                className="
                  flex items-center gap-2
                  p-1.5 pl-3
                  rounded-full
                  border border-zinc-700
                  hover:bg-zinc-900
                  transition-colors
                  cursor-pointer
                "
              >

                {/* MEMBER TEXT */}

                <div className="text-right hidden sm:block">

                  <div className="text-xs font-bold text-zinc-100 leading-tight">
                    {user.name}
                  </div>

                  <div className="text-[10px] uppercase font-mono text-amber-500">
                    {user.tier === 'executive_fellow'
                      ? 'Executive'
                      : user.tier === 'founder_pro'
                        ? 'Founder Pro'
                        : 'Member'}
                  </div>

                </div>


                {/* AVATAR */}

                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="
                      w-8 h-8
                      rounded-full
                      object-cover
                      border
                      border-amber-500/40
                    "
                  />
                ) : (
                  <span
                    className="
                      w-8 h-8
                      rounded-full
                      border
                      border-amber-500/40
                      bg-amber-500/20
                      text-amber-400
                      flex
                      items-center
                      justify-center
                      text-xs
                      font-bold
                    "
                  >
                    {(user.name || 'M')
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}


                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />

              </button>


              {/* =================================
                  MEMBER DROPDOWN
              ================================= */}

              {isUserMenuOpen && (
                <div
                  className="
                    absolute
                    right-0
                    mt-2
                    w-56
                    rounded-xl
                    bg-zinc-900
                    shadow-xl
                    border
                    border-zinc-800
                    py-1.5
                    z-50
                    text-xs
                  "
                  onMouseLeave={() =>
                    setIsUserMenuOpen(false)
                  }
                >

                  <div className="px-4 py-2 border-b border-zinc-800">

                    <p className="font-semibold text-zinc-100">
                      {user.name}
                    </p>

                    <p className="text-[11px] text-zinc-500 truncate">
                      {user.company}
                    </p>

                    <p className="text-[11px] font-mono text-amber-500 mt-0.5">
                      {user.subdomain}
                      .thefoundergrid.com
                    </p>

                  </div>


                  <Link
                    to="/founder/dashboard"
                    onClick={() =>
                      setIsUserMenuOpen(false)
                    }
                    className="
                      flex items-center gap-2
                      px-4 py-2
                      text-zinc-300
                      hover:bg-zinc-800
                    "
                  >
                    <Globe className="w-3.5 h-3.5 text-amber-500" />
                    <span>Founder Studio</span>
                  </Link>


                  <Link
                    to="/founder/profile"
                    onClick={() =>
                      setIsUserMenuOpen(false)
                    }
                    className="
                      flex items-center gap-2
                      px-4 py-2
                      text-zinc-300
                      hover:bg-zinc-800
                    "
                  >
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Profile Settings</span>
                  </Link>


                  <Link
                    to="/founder/portfolio"
                    onClick={() =>
                      setIsUserMenuOpen(false)
                    }
                    className="
                      flex items-center gap-2
                      px-4 py-2
                      text-zinc-300
                      hover:bg-zinc-800
                    "
                  >
                    <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                    <span>My Public Portfolio</span>
                  </Link>


                  {onOpenMembershipModal && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenMembershipModal();
                      }}
                      className="
                        w-full
                        text-left
                        flex items-center gap-2
                        px-4 py-2
                        text-zinc-300
                        hover:bg-zinc-800
                        cursor-pointer
                      "
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      <span>Membership Tiers</span>
                    </button>
                  )}


                  <div className="border-t border-zinc-800 my-1" />


                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      auth?.logout();
                      navigate('/');
                    }}
                    className="
                      w-full
                      text-left
                      flex items-center gap-2
                      px-4 py-2
                      text-rose-400
                      hover:bg-rose-950/30
                      cursor-pointer
                    "
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>

                </div>
              )}

            </div>
          ) : (

            /* =================================
               NOT LOGGED IN
            ================================= */

            <div className="flex items-center gap-2">

              <Link
                to="/auth/login"
                className="
                  px-3 py-1.5
                  text-xs
                  font-semibold
                  text-zinc-300
                  hover:text-white
                "
              >
                Sign In
              </Link>

              <Link
                to="/auth/register"
                className="
                  px-3.5 py-1.5
                  text-xs
                  font-semibold
                  bg-amber-600
                  hover:bg-amber-500
                  text-white
                  rounded-lg
                  transition-colors
                "
              >
                Join Network
              </Link>

            </div>

          )}

        </div>

      </div>

    </header>
  );
};

export default Navbar;