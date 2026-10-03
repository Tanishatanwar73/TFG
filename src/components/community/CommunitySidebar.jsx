import React, { useEffect, useState } from 'react';
import { ChannelList } from './ChannelList';
import {
  MessageSquare,
  Lock
} from 'lucide-react';
import { membersService } from '../../services/supabase/membersService';

export const CommunitySidebar = ({
  channels = [],
  activeChannelId,
  onSelectChannel,
  activeDmUser,
  onSelectDmUser,
  onOpenMemberPopup,
}) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data =
          await membersService.getAllMembers();

        setMembers(data || []);
      } catch (error) {
        console.error(
          'Error fetching community members:',
          error
        );

        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  return (
    <aside className="w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 p-4 space-y-6 flex flex-col justify-between overflow-y-auto">

      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
          <MessageSquare className="w-4 h-4 text-amber-600" />

          <span>
            Deal Room & Exchange
          </span>
        </div>

        {/* Channel Navigation */}
        <ChannelList
          channels={channels}
          activeChannelId={activeChannelId}
          onSelectChannel={onSelectChannel}
        />

        {/* Active Syndicate Members */}
        <div className="space-y-1 pt-4 border-t border-zinc-100 dark:border-zinc-800">

          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center justify-between">

            <span>
              Direct Exchanges
            </span>

            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />

          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-2 px-3">
              {[1, 2, 3, 4, 5].map(
                (item) => (
                  <div
                    key={item}
                    className="h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 animate-pulse"
                  />
                )
              )}
            </div>
          )}

          {/* Members */}
          {!loading &&
            members
              .slice(0, 5)
              .map((member) => {

                const isSelected =
                  activeDmUser?.id ===
                  member.id;

                return (
                  <button
                    key={member.id}
                    onClick={() =>
                      onSelectDmUser
                        ? onSelectDmUser(member)
                        : onOpenMemberPopup &&
                          onOpenMemberPopup(
                            member
                          )
                    }
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                    }`}
                  >

                    <div className="relative">

                      <img
                        src={
                          member.avatarUrl || ''
                        }
                        alt={member.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />

                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-zinc-900" />

                    </div>

                    <div className="min-w-0 flex-1 truncate">

                      <span className="font-medium truncate">
                        {member.name}
                      </span>

                    </div>

                  </button>
                );
              })}

          {/* No members */}
          {!loading &&
            members.length === 0 && (
              <p className="px-3 py-3 text-xs text-zinc-500">
                No members available.
              </p>
            )}

        </div>
      </div>

      {/* Security note */}
      <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 space-y-1">

        <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 font-semibold">

          <Lock className="w-3 h-3 text-amber-600" />

          <span>
            End-to-End Encrypted
          </span>

        </div>

        <p className="text-[10px]">
          Executive discussions are bound by The Founder Grid Mutual NDA.
        </p>

      </div>

    </aside>
  );
};

export default CommunitySidebar;