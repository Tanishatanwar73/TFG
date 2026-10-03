import { getSupabase } from '../../lib/supabase/client';
import { FounderMember } from '../../types';

export const membersService = {
  /*
   * =========================================
   * GET ALL MEMBERS
   * =========================================
   */

  async getAllMembers(): Promise<FounderMember[] | null> {
    const supabase = getSupabase();

    if (!supabase) {
      console.warn(
        'Supabase client is not available.'
      );

      return null;
    }

    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('is_verified', {
          ascending: false
        });

      if (error) {
        console.warn(
          'Supabase members fetch error:',
          error.message
        );

        return null;
      }

      if (!data) {
        console.warn(
          'Supabase returned no members data.'
        );

        return [];
      }

      /*
       * Map database rows to FounderMember
       */

      return data.map(
        (row: any): FounderMember => ({
          id: row.id,

          role: row.role,

          name: row.name,

          handle: row.handle,

          subdomain: row.subdomain,

          title: row.title,

          companyName:
            row.company_name,

          companyUrl:
            row.company_url ||
            undefined,

          industry:
            row.industry,

          location:
            row.location,

          avatarUrl:
            row.avatar_url,

          coverUrl:
            row.cover_url ||
            undefined,

          bio:
            row.bio,

          missionVision:
            row.mission_vision,

          coreValues:
            Array.isArray(
              row.core_values
            )
              ? row.core_values
              : [],

          services:
            Array.isArray(
              row.services
            )
              ? row.services
              : [],

          caseStudies:
            Array.isArray(
              row.case_studies
            )
              ? row.case_studies
              : [],

          fundingStage:
            row.funding_stage,

          metrics:
            row.metrics || {},

          isVerified:
            row.is_verified,

          membershipTier:
            row.membership_tier,

          membershipBadge:
            row.membership_badge,

          membershipCertificateId:
            row.membership_certificate_id,

          membershipJoinedDate:
            row.membership_joined_date,

          renewalDate:
            row.renewal_date ||
            undefined,

          articlesPublishedThisWeek:
            row.articles_published_this_week ||
            0,

          weeklyArticleQuota:
            row.weekly_article_quota ||
            3,

          /*
           * Articles are loaded separately
           * through articlesService.
           */

          articles: [],

          lookingFor:
            Array.isArray(
              row.looking_for
            )
              ? row.looking_for
              : [],

          canOffer:
            Array.isArray(
              row.can_offer
            )
              ? row.can_offer
              : [],

          email:
            row.email ||
            undefined,

          phone:
            row.phone ||
            undefined,

          linkedinUrl:
            row.linkedin_url ||
            undefined,

          privacy:
            row.privacy_settings ||
            {}
        })
      );
    } catch (err) {
      console.error(
        'Error fetching members from Supabase:',
        err
      );

      return null;
    }
  },

  /*
   * =========================================
   * CREATE MEMBER
   * =========================================
   */

  async createMember(
    member: FounderMember
  ): Promise<boolean> {
    const supabase = getSupabase();

    if (!supabase) {
      console.error(
        'Supabase client is not available.'
      );

      return false;
    }

    try {
      const { error } =
        await supabase
          .from('members')
          .insert({
            id: member.id,

            role: String(
              member.role
            ),

            name:
              member.name,

            handle:
              member.handle,

            subdomain:
              member.subdomain,

            title:
              member.title,

            company_name:
              member.companyName,

            company_url:
              member.companyUrl ||
              null,

            industry:
              member.industry,

            location:
              member.location,

            avatar_url:
              member.avatarUrl,

            cover_url:
              member.coverUrl ||
              null,

            bio:
              member.bio,

            mission_vision:
              member.missionVision,

            core_values:
              member.coreValues,

            services:
              member.services,

            case_studies:
              member.caseStudies,

            funding_stage:
              member.fundingStage,

            metrics:
              member.metrics,

            is_verified:
              member.isVerified,

            membership_tier:
              member.membershipTier,

            membership_badge:
              member.membershipBadge,

            membership_certificate_id:
              member.membershipCertificateId,

            membership_joined_date:
              member.membershipJoinedDate,

            renewal_date:
              member.renewalDate ||
              null,

            articles_published_this_week:
              member.articlesPublishedThisWeek,

            weekly_article_quota:
              member.weeklyArticleQuota ||
              3,

            looking_for:
              member.lookingFor ||
              [],

            can_offer:
              member.canOffer ||
              [],

            email:
              member.email ||
              null,

            phone:
              member.phone ||
              null,

            linkedin_url:
              member.linkedinUrl ||
              null,

            privacy_settings:
              member.privacy ||
              null
          });

      if (error) {
        console.error(
          'Error creating member:',
          error.message
        );

        return false;
      }

      return true;
    } catch (err) {
      console.error(
        'Error creating member in Supabase:',
        err
      );

      return false;
    }
  },

  /*
   * =========================================
   * UPDATE MEMBER
   * =========================================
   */

  async updateMember(
    memberId: string,
    updates: Partial<FounderMember>
  ): Promise<boolean> {
    const supabase = getSupabase();

    if (!supabase) {
      console.error(
        'Supabase client is not available.'
      );

      return false;
    }

    try {
      const payload: any = {};

      if (updates.name !== undefined) {
        payload.name = updates.name;
      }

      if (updates.companyName !== undefined) {
        payload.company_name = updates.companyName;
      }

      if (updates.location !== undefined) {
        payload.location = updates.location;
      }

      if (updates.avatarUrl !== undefined) {
        payload.avatar_url = updates.avatarUrl;
      }

      if (updates.caseStudies !== undefined) {
        payload.case_studies = updates.caseStudies;
      }

      if (
        updates.subdomain !==
        undefined
      ) {
        payload.subdomain =
          updates.subdomain;
      }

      if (
        updates.isVerified !==
        undefined
      ) {
        payload.is_verified =
          updates.isVerified;
      }

      if (
        updates.articlesPublishedThisWeek !==
        undefined
      ) {
        payload.articles_published_this_week =
          updates.articlesPublishedThisWeek;
      }

      if (
        updates.bio !==
        undefined
      ) {
        payload.bio =
          updates.bio;
      }

      if (
        updates.title !==
        undefined
      ) {
        payload.title =
          updates.title;
      }

      if (
        updates.membershipTier !==
        undefined
      ) {
        payload.membership_tier =
          updates.membershipTier;
      }

      if (
        updates.metrics !==
        undefined
      ) {
        payload.metrics =
          updates.metrics;
      }

      if (
        updates.privacy !==
        undefined
      ) {
        payload.privacy_settings =
          updates.privacy;
      }

      const { data, error } =
        await supabase
          .from('members')
          .update(payload)
          .eq('id', memberId)
          .select();

      if (error) {
        console.error(
          'Error updating member:',
          error.message
        );

        return false;
      }

      console.log(
        'Member updated successfully:',
        data
      );

      return true;
    } catch (err) {
      console.error(
        'Error updating member in Supabase:',
        err
      );

      return false;
    }
  }
};