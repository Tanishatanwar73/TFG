import { getSupabase } from '../lib/supabase/client';
import { membersService } from './supabase/membersService';

const AUTH_STORAGE_KEY = 'tfg_current_user';

export const authService = {
  async getCurrentUser() {
    try {
      const supabase = getSupabase();

      if (!supabase) {
        return null;
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      const members = await membersService.getAllMembers();

      const member = members?.find(
        (item) =>
          item.id === user.id ||
          item.email?.toLowerCase() === user.email?.toLowerCase()
      );

      if (member) {
        this.setCurrentUser(member);
        return member;
      }

      return {
        id: user.id,
        email: user.email,
      };
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },

  setCurrentUser(user) {
    if (!user) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify(user)
    );
  },

  async login(email, password) {
    try {
      const supabase = getSupabase();

      if (!supabase) {
        return {
          success: false,
          error: 'Supabase is not configured.',
        };
      }

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      const authUser = data.user;

      const members = await membersService.getAllMembers();

      const member = members?.find(
        (item) =>
          item.id === authUser.id ||
          item.email?.toLowerCase() === email.toLowerCase()
      );

      const user =
        member || {
          id: authUser.id,
          email: authUser.email,
        };

      this.setCurrentUser(user);

      return {
        success: true,
        user,
      };
    } catch (error) {
      console.error('Login failed:', error);

      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  },

  async register({
    name,
    email,
    password,
    company,
    role = 'Founder',
    tier = 'founder_pro',
  }) {
    try {
      const supabase = getSupabase();

      if (!supabase) {
        return {
          success: false,
          error: 'Supabase is not configured.',
        };
      }

      const { data, error } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              company,
              role,
              membershipTier: tier,
            },
          },
        });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      const authUser = data.user;

      if (!authUser) {
        return {
          success: false,
          error: 'Unable to create user account.',
        };
      }

      const subdomain =
        name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '') ||
        `founder-${Date.now()}`;

      const member = await membersService.createMember({
        id: authUser.id,
        role,
        name,
        handle: subdomain,
        subdomain,
        title: 'Founder & CEO',
        companyName: company || `${name} Ventures`,
        industry: '',
        location: '',
        avatarUrl: '',
        coverUrl: '',
        bio: '',
        missionVision: '',
        coreValues: [],
        services: [],
        caseStudies: [],
        fundingStage: '',
        metrics: {},
        isVerified: false,
        membershipTier: tier,
        membershipBadge: '',
        membershipCertificateId: '',
        membershipJoinedDate: new Date().toISOString(),
        renewalDate: null,
        articlesPublishedThisWeek: 0,
        weeklyArticleQuota:
          tier === 'executive_fellow' ? 20 : 5,
        lookingFor: [],
        canOffer: [],
        email,
        phone: '',
        linkedinUrl: '',
        privacy: {},
      });

      this.setCurrentUser(member);

      return {
        success: true,
        user: member,
      };
    } catch (error) {
      console.error('Registration failed:', error);

      return {
        success: false,
        error: error.message || 'Registration failed',
      };
    }
  },

  async resetPassword(email) {
    try {
      const supabase = getSupabase();

      if (!supabase) {
        return {
          success: false,
          error: 'Supabase is not configured.',
        };
      }

      const { error } =
        await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        message: `Password reset instructions sent to ${email}`,
      };
    } catch (error) {
      console.error(
        'Password reset failed:',
        error
      );

      return {
        success: false,
        error:
          error.message ||
          'Password reset failed',
      };
    }
  },

  async logout() {
    try {
      const supabase = getSupabase();

      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }

    localStorage.removeItem(AUTH_STORAGE_KEY);
  },
};

export default authService;