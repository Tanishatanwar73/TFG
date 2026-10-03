import { membersService } from './supabase/membersService';
import { inquiriesService } from './supabase/inquiriesService';

export const founderService = {
  async getAllFounders() {
    try {
      const live = await membersService.getAllMembers();
      return live || [];
    } catch (e) {
      console.error('Failed to fetch members from Supabase:', e);
      return [];
    }
  },

  async getFounderBySubdomain(subdomain) {
    const list = await this.getAllFounders();

    return (
      list.find(
        (member) =>
          member.subdomain?.toLowerCase() === subdomain?.toLowerCase()
      ) || null
    );
  },

  async getFounderById(id) {
    const list = await this.getAllFounders();

    return list.find((member) => member.id === id) || null;
  },

  async updateProfile(id, updates) {
    try {
      const updatedMember = await membersService.updateMember(id, updates);

      if (!updatedMember) {
        return {
          success: false,
          error: 'Supabase did not update the member record.',
        };
      }

      return {
        success: true,
        ...updates,
        ...(updatedMember || {}),
      };
    } catch (e) {
      console.error('Failed to update member in Supabase:', e);

      return {
        success: false,
        error: e.message || 'Failed to update profile',
      };
    }
  },

  async getInquiriesForFounder(founderId) {
    try {
      const inquiries = await inquiriesService.getInquiries();

      if (!inquiries) {
        return [];
      }

      return inquiries.filter(
        (inquiry) => inquiry.targetMemberId === founderId
      );
    } catch (e) {
      console.error('Failed to fetch inquiries from Supabase:', e);
      return [];
    }
  },

  async submitInquiry(inquiryData) {
    try {
      const createdInquiry =
        await inquiriesService.createInquiry(inquiryData);

      return {
        success: true,
        ...(createdInquiry || {}),
      };
    } catch (e) {
      console.error('Failed to submit inquiry to Supabase:', e);

      return {
        success: false,
        error: e.message || 'Failed to submit inquiry',
      };
    }
  },
};

export default founderService;