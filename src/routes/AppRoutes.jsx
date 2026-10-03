import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { getSupabase } from '../lib/supabase/client';

// =========================
// HOME
// =========================
import { Home } from '../pages/Home';

// =========================
// AUTH
// =========================
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ResetPassword } from '../pages/auth/ResetPassword';

// =========================
// FOUNDER
// =========================
import { FounderDashboard } from '../pages/founder/FounderDashboard';
import { FounderProfile } from '../pages/founder/FounderProfile';
import { MyPortfolio } from '../pages/founder/MyPortfolio';
import { MyArticles } from '../pages/founder/MyArticles';
import { CreateArticle } from '../pages/founder/CreateArticle';
import { Inquiries } from '../pages/founder/Inquiries';
import { EditPortfolio } from '../pages/founder/EditPortfolio';

// =========================
// DIRECTORY
// =========================
import { Directory } from '../pages/directory/Directory';
import { Founders } from '../pages/directory/Founders';
import { Investors } from '../pages/directory/Investors';

// =========================
// COMMUNITY
// =========================
import { Community } from '../pages/community/Community';
import { Announcements } from '../pages/community/Announcements';
import { BusinessNetworking } from '../pages/community/BusinessNetworking';
import { DealsPartnerships } from '../pages/community/DealsPartnerships';
import { Messages } from '../pages/community/Messages';

// =========================
// PORTFOLIO
// =========================
import { Portfolio } from '../pages/portfolio/Portfolio';
import { PublicFounderProfile } from '../pages/portfolio/PublicFounderProfile';

// =========================
// ADMIN
// =========================
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { Articles } from '../pages/admin/Articles';
import { Members } from '../pages/admin/Members';
import { Advertisements } from '../pages/admin/Advertisements';
import { Verification } from '../pages/admin/Verification';
import { Moderation } from '../pages/admin/Moderation';

// =========================
// ROUTE GUARDS
// =========================
import { ProtectedRoute } from './ProtectedRoute';


// ======================================================
// ONLY THESE TWO EMAILS CAN ACCESS ADMIN
// ======================================================

const ADMIN_EMAILS = [
  'marketingnirbhay98@gmail.com',
  'tanishatanwar39@gmail.com',
];


// ======================================================
// ADMIN ROUTE GUARD
// ======================================================

const AdminOnlyRoute = ({ children }) => {
  const [loading, setLoading] = React.useState(true);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    const checkAdmin = async () => {
      try {
        const supabase = getSupabase();

        if (!supabase) {
          if (mounted) {
            setIsAdmin(false);
            setLoading(false);
          }

          return;
        }

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user?.email) {
          if (mounted) {
            setIsAdmin(false);
            setLoading(false);
          }

          return;
        }

        const email = user.email
          .toLowerCase()
          .trim();

        const allowed =
          ADMIN_EMAILS.includes(email);

        if (mounted) {
          setIsAdmin(allowed);
          setLoading(false);
        }
      } catch (error) {
        console.error(
          'Admin access check failed:',
          error
        );

        if (mounted) {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    };

    checkAdmin();

    return () => {
      mounted = false;
    };
  }, []);

  // While checking Supabase
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">
          Checking access...
        </div>
      </div>
    );
  }

  // User is not one of the two admins
  if (!isAdmin) {
    return (
      <Navigate
        to="/auth/login"
        replace
      />
    );
  }

  // Admin is allowed
  return children;
};


// ======================================================
// APP ROUTES
// ======================================================

export const AppRoutes = () => {
  return (
    <Routes>

      {/* ================================================
          HOME
      ================================================ */}

      <Route
        path="/"
        element={<Home />}
      />


      {/* ================================================
          AUTH
      ================================================ */}

      <Route
        path="/auth/login"
        element={<Login />}
      />

      <Route
        path="/auth/register"
        element={<Register />}
      />

      <Route
        path="/auth/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/auth/reset-password"
        element={<ResetPassword />}
      />


      {/* ================================================
          FOUNDER DASHBOARD
      ================================================ */}

      <Route
        path="/founder/dashboard"
        element={
          <ProtectedRoute>
            <FounderDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/founder/profile"
        element={
          <ProtectedRoute>
            <FounderProfile />
          </ProtectedRoute>
        }
        />
      <Route
       path="/founder/portfolio/edit"
        element={
          <ProtectedRoute>
           <EditPortfolio />
           </ProtectedRoute>
         }
        />

      <Route
        path="/founder/portfolio"
        element={
          <ProtectedRoute>
            <MyPortfolio />
          </ProtectedRoute>
        }
      />

      <Route
        path="/founder/articles"
        element={
          <ProtectedRoute>
            <MyArticles />
          </ProtectedRoute>
        }
      />

      <Route
        path="/founder/inquiries"
        element={
          <ProtectedRoute>
            <Inquiries />
          </ProtectedRoute>
        }
      />


      {/* ================================================
          CREATE ARTICLE
          ONLY THE TWO ADMIN EMAILS
      ================================================ */}

      <Route
        path="/founder/create-article"
        element={
          <AdminOnlyRoute>
            <CreateArticle />
          </AdminOnlyRoute>
        }
      />


      {/* ================================================
          DIRECTORY
      ================================================ */}

      <Route
        path="/directory"
        element={<Directory />}
      />

      <Route
        path="/directory/founders"
        element={<Founders />}
      />

      <Route
        path="/directory/investors"
        element={<Investors />}
      />


      {/* ================================================
          COMMUNITY
      ================================================ */}

      <Route
        path="/community"
        element={<Community />}
      />

      <Route
        path="/community/announcements"
        element={<Announcements />}
      />

      <Route
        path="/community/business-networking"
        element={<BusinessNetworking />}
      />

      <Route
        path="/community/deals-partnerships"
        element={<DealsPartnerships />}
      />

      <Route
        path="/community/messages"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />


      {/* ================================================
          PORTFOLIO
      ================================================ */}

      <Route
        path="/portfolio"
        element={<Portfolio />}
      />

      <Route
        path="/portfolio/:subdomain"
        element={<PublicFounderProfile />}
      />


      {/* ================================================
          ADMIN
          ONLY THE TWO ADMIN EMAILS
      ================================================ */}

      <Route
        path="/admin"
        element={
          <AdminOnlyRoute>
            <AdminDashboard />
          </AdminOnlyRoute>
        }
      />

      <Route
        path="/admin/articles"
        element={
          <AdminOnlyRoute>
            <Articles />
          </AdminOnlyRoute>
        }
      />

      <Route
        path="/admin/members"
        element={
          <AdminOnlyRoute>
            <Members />
          </AdminOnlyRoute>
        }
      />

      <Route
        path="/admin/advertisements"
        element={
          <AdminOnlyRoute>
            <Advertisements />
          </AdminOnlyRoute>
        }
      />

      <Route
        path="/admin/verification"
        element={
          <AdminOnlyRoute>
            <Verification />
          </AdminOnlyRoute>
        }
      />

      <Route
        path="/admin/moderation"
        element={
          <AdminOnlyRoute>
            <Moderation />
          </AdminOnlyRoute>
        }
      />


      {/* ================================================
          UNKNOWN URL
      ================================================ */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
};