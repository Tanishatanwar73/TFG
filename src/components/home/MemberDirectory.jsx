import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Search,
  Users,
  ArrowRight,
  MapPin,
  Building2,
  ExternalLink,
} from 'lucide-react';

import { membersService } from '../../services/supabase/membersService';
import { FounderCard } from './FounderCard';

export const MemberDirectory = ({ onOpenPortfolio }) => {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // GET MEMBERS FROM SUPABASE
  // ==========================================

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data =
          await membersService.getAllMembers();

        setMembers(data || []);
      } catch (error) {
        console.error(
          'Error fetching members:',
          error
        );

        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // ==========================================
  // FILTER MEMBERS
  // ==========================================

  const filteredMembers = members
    .filter((member) => {
      // Role filter
      if (
        roleFilter !== 'All' &&
        member.role !== roleFilter
      ) {
        return false;
      }

      // Search filter
      if (query.trim()) {
        const q = query.toLowerCase().trim();

        return (
          member.name
            ?.toLowerCase()
            .includes(q) ||
          member.companyName
            ?.toLowerCase()
            .includes(q) ||
          member.subdomain
            ?.toLowerCase()
            .includes(q) ||
          member.industry
            ?.toLowerCase()
            .includes(q) ||
          member.location
            ?.toLowerCase()
            .includes(q)
        );
      }

      return true;
    })
    .slice(0, 6);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <section
      className="
        border-t
        border-amber-200/70
        bg-gradient-to-b
        from-[#fbf7f0]
        to-transparent
        py-14
        dark:border-zinc-800
        dark:from-zinc-950
        dark:to-transparent
      "
    >

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="mb-8 flex flex-col gap-5 px-4 sm:px-6 lg:px-10 xl:px-12">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          {/* TITLE */}

          <div>
            <div className="mb-2 flex items-center gap-2">

              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-amber-600
                  dark:bg-amber-400
                "
              />

              <span
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-amber-700
                  dark:text-amber-400
                "
              >
                The Founder Grid
              </span>

            </div>

            <h2
              className="
                font-serif
                text-2xl
                font-bold
                text-amber-900
                sm:text-3xl
                dark:text-amber-100
              "
            >
              Syndicate Member Directory
            </h2>

            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-zinc-600
                dark:text-zinc-400
              "
            >
              Browse verified founders, executives,
              and accredited investor partners.
            </p>
          </div>


          {/* =====================================
              SEARCH + FILTER
          ===================================== */}

          <div className="flex flex-col gap-3 sm:flex-row">

            {/* SEARCH */}

            <div className="relative">

              <Search
                className="
                  absolute
                  left-3
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-zinc-400
                "
              />

              <input
                type="text"
                placeholder="Search by name, company..."
                value={query}
                onChange={(e) =>
                  setQuery(e.target.value)
                }
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-amber-900/15
                  bg-white
                  py-2
                  pl-9
                  pr-3
                  text-xs
                  text-zinc-900
                  shadow-sm
                  outline-none
                  transition
                  focus:border-amber-500
                  focus:ring-2
                  focus:ring-amber-500/10
                  sm:w-64
                  dark:border-zinc-700
                  dark:bg-zinc-900
                  dark:text-zinc-100
                "
              />

            </div>


            {/* ROLE FILTER */}

            <div
              className="
                flex
                h-10
                items-center
                rounded-lg
                border
                border-amber-900/10
                bg-amber-100/60
                p-1
                text-xs
                dark:border-zinc-700
                dark:bg-zinc-900
              "
            >

              {['All', 'Founder', 'Investor'].map(
                (role) => (
                  <button
                    key={role}
                    onClick={() =>
                      setRoleFilter(role)
                    }
                    className={`
                      rounded-md
                      px-3
                      py-1.5
                      font-medium
                      transition-colors
                      cursor-pointer
                      ${
                        roleFilter === role
                          ? `
                            bg-white
                            text-amber-900
                            shadow-sm
                            dark:bg-zinc-800
                            dark:text-amber-100
                          `
                          : `
                            text-zinc-500
                            hover:text-zinc-900
                            dark:hover:text-zinc-200
                          `
                      }
                    `}
                  >
                    {role}
                  </button>
                )
              )}

            </div>

          </div>

        </div>

      </div>


      {/* ========================================
          LOADING
      ======================================== */}

      {loading && (
        <div
          className="
            grid
            grid-cols-1
            gap-6
            px-4
            sm:px-6
            md:grid-cols-2
            lg:grid-cols-3
            lg:px-10
            xl:px-12
          "
        >
          {[1, 2, 3, 4, 5, 6].map(
            (item) => (
              <div
                key={item}
                className="
                  min-h-[330px]
                  rounded-2xl
                  border
                  border-zinc-200
                  bg-zinc-100
                  animate-pulse
                  dark:border-zinc-800
                  dark:bg-zinc-900
                "
              />
            )
          )}
        </div>
      )}


      {/* ========================================
          NO MEMBERS
      ======================================== */}

      {!loading &&
        filteredMembers.length === 0 && (
          <div
            className="
              mx-4
              rounded-2xl
              border
              border-dashed
              border-zinc-300
              bg-white/60
              px-6
              py-16
              text-center
              sm:mx-6
              lg:mx-10
              dark:border-zinc-700
              dark:bg-zinc-900/50
            "
          >

            <Users
              className="
                mx-auto
                mb-4
                h-9
                w-9
                text-zinc-400
              "
            />

            <p
              className="
                text-sm
                font-medium
                text-zinc-600
                dark:text-zinc-300
              "
            >
              No members found.
            </p>

            <p
              className="
                mt-1
                text-xs
                text-zinc-400
              "
            >
              Try another name, company,
              industry, or location.
            </p>

          </div>
        )}


      {/* ========================================
          MEMBER CARDS
      ======================================== */}

      {!loading &&
        filteredMembers.length > 0 && (
          <div
            className="
              grid
              grid-cols-1
              gap-7
              px-4
              sm:px-6
              md:grid-cols-2
              lg:grid-cols-3
              lg:px-10
              xl:px-12
            "
          >

            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="
                  group
                  min-h-[340px]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-zinc-200
                  bg-white
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-xl
                  hover:border-amber-300
                  dark:border-zinc-800
                  dark:bg-zinc-900
                  dark:hover:border-amber-700
                "
              >

                <FounderCard
                  member={member}
                  onOpenPortfolio={onOpenPortfolio}
                />

              </div>
            ))}

          </div>
        )}


      {/* ========================================
          FULL DIRECTORY BUTTON
      ======================================== */}

      <div className="mt-10 text-center">

        <Link
          to="/directory"
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-amber-700
            px-7
            py-3
            text-xs
            font-semibold
            text-white
            shadow-sm
            transition-all
            hover:bg-amber-800
            hover:shadow-md
            dark:bg-amber-500
            dark:text-zinc-950
            dark:hover:bg-amber-400
          "
        >

          <span>
            Open Full Interactive Directory
          </span>

          <ArrowRight className="h-3.5 w-3.5" />

        </Link>

      </div>

    </section>
  );
};

export default MemberDirectory;