import React, { useEffect, useState } from 'react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { MemberManagement } from '../../components/admin/MemberManagement';
import { membersService } from '../../services/supabase/membersService';

export const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);

        const data = await membersService.getAllMembers();

        setMembers(data || []);
      } catch (error) {
        console.error('Failed to load members:', error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  const handleUpdateMember = async (id, updates) => {
    try {
      const updatedMember = await membersService.updateMember(
        id,
        updates
      );

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
      console.error('Failed to update member:', error);
    }
  };

  return (
    <div className="flex-1 flex max-w-7xl w-full mx-auto py-6">
      <AdminSidebar />

      <main className="flex-1 min-w-0 p-6 sm:p-8 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">
              Loading members...
            </p>
          </div>
        ) : (
          <MemberManagement
            members={members}
            onUpdateMember={handleUpdateMember}
          />
        )}
      </main>
    </div>
  );
};

export default Members;