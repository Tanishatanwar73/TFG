import React, { useEffect, useState } from 'react';



import { useNavigate } from 'react-router-dom';



import {

  Edit3,

  Globe,

  MapPin,

  CheckCircle2,

  ArrowUpRight,

  Quote,

  Target,

  Rocket,

  Loader2,

  AlertCircle,

} from 'lucide-react';



import { DashboardLayout } from '../../components/layout/DashboardLayout';

import { getSupabase } from '../../lib/supabase/client';



export const MyPortfolio = () => {

  const navigate = useNavigate();



  const [portfolio, setPortfolio] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');



  /*

   \* Load portfolio using an already authenticated

   \* Supabase user.

   */

  const loadPortfolio = async (user) => {

    setLoading(true);

    setError('');



    try {

      const supabase = getSupabase();



      if (!supabase) {

        throw new Error(

          'Supabase is not configured.'

        );

      }



      if (!user) {

        throw new Error(

          'Please log in to view your portfolio.'

        );

      }



      console.log(

        'Loading portfolio for:',

        user.email

      );



      let member = null;



      /*

       \* ------------------------------------------------

       \* 1. Try Auth user ID

       \* ------------------------------------------------

       */

      const {

        data: memberById,

        error: idError,

      } = await supabase

        .from('members')

        .select('*')

        .eq('id', user.id)

        .maybeSingle();



      if (!idError && memberById) {

        member = memberById;

      }



      /*

       \* ------------------------------------------------

       \* 2. Try subdomain

       \* ------------------------------------------------

       */

      if (!member) {

        const subdomain =

          user.user_metadata?.subdomain;



        if (subdomain) {

          const {

            data: memberBySubdomain,

            error: subdomainError,

          } = await supabase

            .from('members')

            .select('*')

            .eq('subdomain', subdomain)

            .maybeSingle();



          if (

            !subdomainError &&

            memberBySubdomain

          ) {

            member = memberBySubdomain;

          }

        }

      }



      /*

       \* ------------------------------------------------

       \* 3. Try email

       \* ------------------------------------------------

       */

      if (!member && user.email) {

        const normalizedEmail = user.email

          .trim()

          .toLowerCase();



        const {

          data: memberByEmail,

          error: emailQueryError,

        } = await supabase

          .from('members')

          .select('*')

          .ilike('email', normalizedEmail)

          .maybeSingle();



        if (emailQueryError) {

          console.error(

            'Member email lookup failed:',

            emailQueryError

          );

        } else if (memberByEmail) {

          member = memberByEmail;

        }

      }



      /*

       \* ------------------------------------------------

       \* 4. If still no member

       \* ------------------------------------------------

       */

      if (!member) {

        throw new Error(

          'No portfolio was found for this account.'

        );

      }



      console.log(

        'Portfolio loaded:',

        member

      );



      setPortfolio(member);

    } catch (err) {

      console.error(

        'Failed to load portfolio:',

        err

      );



      setPortfolio(null);



      setError(

        err?.message ||

          'Failed to load your portfolio.'

      );

    } finally {

      setLoading(false);

    }

  };



  /*

   \* --------------------------------------------------

   \* AUTH + PORTFOLIO LOADING

   \* --------------------------------------------------

   */

  useEffect(() => {

    let mounted = true;



    const supabase = getSupabase();



    if (!supabase) {

      setError(

        'Supabase is not configured.'

      );



      setLoading(false);



      return;

    }



    /*

     \* Check the current session.

     */

    const initializePortfolio = async () => {

      try {

        const {

          data,

          error: sessionError,

        } = await supabase.auth.getSession();



        if (sessionError) {

          throw sessionError;

        }



        const session = data?.session;



        /*

         \* No logged-in user.

         */

        if (!session?.user) {

          if (mounted) {

            setError(

              'Your login session is missing. Please log in again.'

            );



            setLoading(false);

          }



          return;

        }



        /*

         \* User exists, load portfolio.

         */

        if (mounted) {

          await loadPortfolio(session.user);

        }

      } catch (err) {

        console.error(

          'Failed to initialize portfolio:',

          err

        );



        if (mounted) {

          setError(

            err?.message ||

              'Failed to load your portfolio.'

          );



          setLoading(false);

        }

      }

    };



    initializePortfolio();



    /*

     \* Listen for login/logout changes.

     */

    const {

      data: authListener,

    } = supabase.auth.onAuthStateChange(

      async (event, session) => {

        if (!mounted) {

          return;

        }



        console.log(

          'Auth event:',

          event

        );



        if (

          event === 'SIGNED_IN' &&

          session?.user

        ) {

          await loadPortfolio(

            session.user

          );

        }



        if (event === 'SIGNED_OUT') {

          setPortfolio(null);



          setError(

            'You have been signed out. Please log in again.'

          );



          setLoading(false);

        }

      }

    );



    return () => {

      mounted = false;



      authListener?.subscription?.unsubscribe();

    };

  }, []);



  /*

   \* --------------------------------------------------

   \* RETRY

   \* --------------------------------------------------

   */

  const handleRetry = async () => {

    setLoading(true);

    setError('');



    try {

      const supabase = getSupabase();



      if (!supabase) {

        throw new Error(

          'Supabase is not configured.'

        );

      }



      const {

        data,

        error: sessionError,

      } = await supabase.auth.getSession();



      if (sessionError) {

        throw sessionError;

      }



      const session = data?.session;



      if (!session?.user) {

        setError(

          'Your login session is missing. Please log in again.'

        );



        setLoading(false);



        return;

      }



      await loadPortfolio(session.user);

    } catch (err) {

      console.error(

        'Retry failed:',

        err

      );



      setError(

        err?.message ||

          'Failed to load your portfolio.'

      );



      setLoading(false);

    }

  };



  /*
   \* METRIC HELPER
   */

  const getMetric = (

    key,

    fallback

  ) => {

    if (!portfolio?.metrics) {

      return fallback;

    }



    if (

      typeof portfolio.metrics ===

        'object' &&

      portfolio.metrics[key] !==

        undefined

    ) {

      return portfolio.metrics[key];

    }



    return fallback;

  };



  /*

   \* --------------------------------------------------

   \* ARRAY HELPER

   \* --------------------------------------------------

   */

  const getArray = (value) => {

    if (Array.isArray(value)) {

      return value;

    }



    if (typeof value === 'string') {

      return value

        .split('\n')

        .map((item) =>

          item.trim()

        )

        .filter(Boolean);

    }



    return [];

  };



  /*

   \* --------------------------------------------------

   \* LOADING STATE

   \* --------------------------------------------------

   */

  if (loading) {

    return (

      <DashboardLayout

        title="My Portfolio"

        subtitle="Your executive portfolio and dossier"

      >

        <div className="flex min-h-[500px] items-center justify-center">

          <div className="flex items-center gap-3 text-zinc-500">

            <Loader2

              size={22}

              className="animate-spin"

            />



            <span>

              Loading your portfolio...

            </span>

          </div>

        </div>

      </DashboardLayout>

    );

  }



  /*

   \* --------------------------------------------------

   \* ERROR STATE

   \* --------------------------------------------------

   */

  if (error) {

    return (

      <DashboardLayout

        title="My Portfolio"

        subtitle="Your executive portfolio and dossier"

      >

        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/20">

          <div className="flex items-start gap-3">

            <AlertCircle

              className="mt-0.5 shrink-0 text-red-500"

              size={22}

            />



            <div>

              <h2 className="font-semibold text-red-700 dark:text-red-400">

                Portfolio could not be loaded

              </h2>



              <p className="mt-1 text-sm text-red-600 dark:text-red-300">

                {error}

              </p>



              <div className="mt-4 flex flex-wrap gap-3">

                <button

                  type="button"

                  onClick={handleRetry}

                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"

                >

                  Try Again

                </button>



                <button

                  type="button"

                  onClick={() =>

                    navigate(

                      '/auth/login'

                    )

                  }

                  className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-800 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-950/30"

                >

                  Go to Login

                </button>

              </div>

            </div>

          </div>

        </div>

      </DashboardLayout>

    );

  }

  /*

   \* --------------------------------------------------

   \* PORTFOLIO DATA

   \* --------------------------------------------------

   */

  const founderName =

    portfolio?.name ||

    'Founder Name';



  const title =

    portfolio?.title ||

    'CEO & Founder';



  const company =

    portfolio?.company_name ||

    'Your Company';



  const industry =

    portfolio?.industry ||

    'Technology & Innovation';



  const location =

    portfolio?.location ||

    'New York, NY';



  const website =

    portfolio?.company_url ||

    (portfolio?.subdomain

      ? `${portfolio.subdomain}.thefoundergrid.com`

      : 'yourcompany.io');

  const summary =
    portfolio?.bio ||
    'Describe your vision, what you are building, and why it matters.';
  const vision =
    portfolio?.mission_vision ||
    'Building a meaningful company with a long-term vision.';
  const funding =
    portfolio?.funding_stage ||
    'Seed Round';
  const activeUsers = getMetric(
    'active_users',
    '140K+'
  );
  const arr = getMetric(
    'yoy_arr',
    '+210%'
  );
  const avatar =
    typeof portfolio?.avatar_url === 'string'
      ? portfolio.avatar_url.trim()
      : '';
  const innovationItems =
    getArray(
      portfolio?.services
    );
  const milestones =
    getArray(
      portfolio?.case_studies
    );
  /*
   \* MAIN PORTFOLIO
   */
  return (
    <DashboardLayout
      title="My Executive Portfolio & Dossier"
      subtitle={`Live at ${
        portfolio?.subdomain
          ? `${portfolio.subdomain}.thefoundergrid.com`
          : 'yourcompany.io'
      }`}
    >
      <div className="mx-auto max-w-6xl">
        {/* EDIT BUTTON */}
        <div className="mb-5 flex items-center justify-end">
          <button
            type="button"
            onClick={() =>
              navigate(
                '/founder/portfolio/edit'
              )
            }
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700"
          >
            <Edit3 size={17} />
            Edit Portfolio
          </button>
        </div>
        {/* PORTFOLIO PAPER */}
        <div className="overflow-hidden rounded-3xl border border-[#d8d1c3] bg-[#f7f5ed] shadow-2xl">
          <div className="p-6 sm:p-8 lg:p-10">
            {/* HEADER */}
            <div className="flex flex-col gap-5 border-b border-[#d8d1c3] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {/* TFG LOGO */}
                <div className="grid h-11 w-11 grid-cols-2 gap-1 rounded-xl border-2 border-[#9b6741] p-1">
                  <span className="rounded bg-[#d8b08a]" />
                  <span className="rounded bg-[#9b6741]" />
                  <span className="rounded bg-[#f1eee5]" />
                  <span className="rounded bg-[#c58b52]" />
                </div>
                <div>
                  <p className="text-[10px] italic text-[#8d6a4e]">
                    The
                  </p>
                  <h2 className="font-serif text-xl font-bold text-[#4d2f20]">
                    Founder Grid
                  </h2>
                </div>
              </div>
              <p className="text-xs font-semibold tracking-widest text-[#4d2f20]">
                EXECUTIVE PROFILE // ISSUE 04
              </p>
            </div>
            {/* PROFILE HEADER */}
            <div className="flex flex-col gap-7 border-b border-[#d8d1c3] py-7 md:flex-row md:items-center">
              {/* AVATAR */}
              <div className="flex justify-center md:justify-start">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={founderName}
                    className="h-32 w-32 rounded-full border-4 border-[#c58b52] object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-[#c58b52] bg-[#eee9dd] font-serif text-4xl text-[#c58b52]">
                    {founderName
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="mb-1 text-xs text-[#8a7566]">
                  Founder Name
                </p>
                <h1 className="font-serif text-4xl font-bold text-[#4d2f20] sm:text-5xl">
                  {founderName}
                </h1>
                <p className="mt-2 text-xl text-[#3f2b20]">
                  {title}, {company}
                </p>
                <p className="mt-2 text-xs font-bold tracking-wide text-[#b8753d]">
                  {industry}
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-3 text-sm text-[#69584c] md:justify-start">
                  <span className="inline-flex items-center gap-1">
                    <Globe size={14} />
                    {website}
                  </span>
                  <span>|</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={14} />
                    {location}
                  </span>
                </div>
              </div>
            </div>
            {/* SUMMARY + METRICS */}
            <div className="grid gap-4 py-6 lg:grid-cols-[1fr_220px]">
              <div className="rounded-2xl border border-[#d8d1c3] p-5">
                <h3 className="font-semibold text-[#38251b]">
                  Executive Summary & Vision
                </h3>
                <div className="mt-4 grid gap-5 md:grid-cols-2">
                  <div>
                    <p className="text-sm leading-6 text-[#66564b]">
                      {summary}
                    </p>
                  </div>
                  <div className="border-l border-[#d8d1c3] pl-5">
                    <Quote
                      size={22}
                      className="text-[#c58b52]"
                    />
                    <p className="mt-2 font-serif text-2xl font-bold leading-tight text-[#c27e45]">
                      {vision}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid gap-3">
                {/* FUNDING */}
                <div className="rounded-2xl border border-[#d8d1c3] p-5 text-center">
                  <p className="font-serif text-3xl font-bold text-[#4d2f20]">
                    {funding}
                  </p>
                  <p className="text-xs font-semibold uppercase">
                    Funding Stage
                  </p>
                </div>
                {/* USERS */}
                <div className="rounded-2xl border border-[#d8d1c3] p-5 text-center">
                  <p className="font-serif text-3xl font-bold text-[#4d2f20]">
                    {activeUsers}
                  </p>
                  <p className="text-xs font-semibold uppercase">
                    Active Users
                  </p>
                </div>
                {/* ARR */}
                <div className="rounded-2xl border border-[#d8d1c3] p-5 text-center">
                  <p className="font-serif text-3xl font-bold text-[#4d2f20]">
                    {arr}
                  </p>
                  <p className="text-xs font-semibold uppercase">
                    YoY ARR
                  </p>
                </div>
              </div>
            </div>
            {/* INNOVATION + MILESTONES */}
            <div className="grid gap-5 rounded-2xl border border-[#d8d1c3] p-5 md:grid-cols-2">
              {/* INNOVATION */}
              <div className="border-b border-[#d8d1c3] pb-5 md:border-b-0 md:border-r md:pb-0 md:pr-6">
                <div className="mb-3 flex items-center gap-2">
                  <Rocket
                    size={18}
                    className="text-[#c58b52]"
                  />
                  <h3 className="font-semibold text-[#38251b]">
                    Product & Market Innovation
                  </h3>
                </div>
                {innovationItems.length > 0 ? (
                  <ul className="space-y-2">
                    {innovationItems
                      .slice(0, 5)
                      .map(
                        (
                          item,
                          index
                        ) => (
                          <li
                            key={index}
                            className="flex gap-2 text-sm text-[#66564b]"
                          >
                            <span className="text-[#c58b52]">
                              ✓
                            </span>
                            <span>
                              {typeof item ===
                              'object'
                                ? item.title ||
                                  item.name ||
                                  JSON.stringify(
                                    item
                                  )
                                : item}
                            </span>
                          </li>
                        )
                      )}
                  </ul>
                ) : (
                  <p className="text-sm text-[#8a7566]">
                    Add your product,
                    services, and
                    innovation
                    highlights.
                  </p>
                )}
              </div>
              {/* MILESTONES */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Target
                    size={18}
                    className="text-[#c58b52]"
                  />
                  <h3 className="font-semibold text-[#38251b]">
                    Key Milestones
                  </h3>
                </div>
                {milestones.length > 0 ? (
                  <ul className="space-y-2">
                    {milestones
                      .slice(0, 5)
                      .map(
                        (
                          item,
                          index
                        ) => (
                          <li
                            key={index}
                            className="text-sm text-[#66564b]"
                          >
                            •{' '}
                            {typeof item ===
                            'object'
                              ? item.title ||
                                item.name ||
                                JSON.stringify(
                                  item
                                )
                              : item}
                          </li>
                        )
                      )}
                  </ul>
                ) : (
                  <p className="text-sm text-[#8a7566]">
                    Add your importan
                    business
                    milestones.
                  </p>
                )}
                <p className="mt-4 text-sm leading-6 text-[#806f63]">
                  {portfolio?.mission_vision ||
                    'Add your future outlook and long-term business direction.'}
                </p>
              </div>
            </div>
            {/* FOOTER */}
            <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-[#d8d1c3] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#c58b52] text-white">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <p className="text-xs text-[#806f63]">
                    Verified by
                  </p>
                  <p className="font-semibold text-[#4d2f20]">
                    The Founder Grid
                  </p>
                </div>
              </div>
              <p className="text-xs font-bold tracking-widest text-[#4d2f20]">
                DECEMBER 2026
              </p>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/portfolio/${
                      portfolio?.subdomain ||
                      ''
                    }`
                  )
                }
                className="inline-flex items-center justify-center gap-2 text-sm font-bold text-[#4d2f20] hover:text-[#b8753d]"
              >
                VIEW FULL PROFILE
                <ArrowUpRight
                  size={15}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyPortfolio;