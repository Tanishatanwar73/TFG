import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';

import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { getSupabase } from '../../lib/supabase/client';

const inputClass =
  'w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';

const labelClass =
  'mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-200';

export const EditPortfolio = () => {
  const navigate = useNavigate();

  const [memberId, setMemberId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    title: '',
    company_name: '',
    company_url: '',
    industry: '',
    location: '',
    avatar_url: '',
    bio: '',
    mission_vision: '',
    funding_stage: '',
    active_users: '',
    yoy_arr: '',
    services: [],
    case_studies: [],
  });

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
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
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        throw new Error(
          'Please log in first.'
        );
      }

      let member = null;

      const { data: memberById } =
        await supabase
          .from('members')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

      if (memberById) {
        member = memberById;
      }

      if (!member) {
        const subdomain =
          user.user_metadata?.subdomain;

        if (subdomain) {
          const { data: memberBySubdomain } =
            await supabase
              .from('members')
              .select('*')
              .eq('subdomain', subdomain)
              .maybeSingle();

          if (memberBySubdomain) {
            member = memberBySubdomain;
          }
        }
      }

      if (!member && user.email) {
        const { data: members } =
          await supabase
            .from('members')
            .select('*')
            .limit(100);

        const matchingMember = (members || []).find(
          (item) =>
            item.email?.toLowerCase() ===
            user.email.toLowerCase()
        );

        if (matchingMember) {
          member = matchingMember;
        }
      }

      if (!member) {
        throw new Error(
          'No member profile was found for this account.'
        );
      }

      setMemberId(member.id);

      let metrics = {};

      if (
        member.metrics &&
        typeof member.metrics === 'object'
      ) {
        metrics = member.metrics;
      }

      const services = Array.isArray(
        member.services
      )
        ? member.services
        : typeof member.services === 'string'
        ? member.services
            .split('\n')
            .filter(Boolean)
        : [];

      const caseStudies = Array.isArray(
        member.case_studies
      )
        ? member.case_studies
        : typeof member.case_studies === 'string'
        ? member.case_studies
            .split('\n')
            .filter(Boolean)
        : [];

      setForm({
        name: member.name || '',
        title: member.title || '',
        company_name:
          member.company_name || '',
        company_url:
          member.company_url || '',
        industry: member.industry || '',
        location: member.location || '',
        avatar_url:
          member.avatar_url || '',
        bio: member.bio || '',
        mission_vision:
          member.mission_vision || '',
        funding_stage:
          member.funding_stage || '',
        active_users:
          metrics.active_users || '',
        yoy_arr:
          metrics.yoy_arr || '',
        services,
        case_studies: caseStudies,
      });
    } catch (err) {
      console.error(
        'Failed to load portfolio:',
        err
      );

      setError(
        err?.message ||
          'Failed to load portfolio.'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateListItem = (
    field,
    index,
    value
  ) => {
    setForm((previous) => {
      const updated = [
        ...(previous[field] || []),
      ];

      updated[index] = value;

      return {
        ...previous,
        [field]: updated,
      };
    });
  };

  const addListItem = (field) => {
    setForm((previous) => ({
      ...previous,
      [field]: [
        ...(previous[field] || []),
        '',
      ],
    }));
  };

  const removeListItem = (
    field,
    index
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: previous[field].filter(
        (_, itemIndex) =>
          itemIndex !== index
      ),
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const supabase = getSupabase();

      if (!supabase) {
        throw new Error(
          'Supabase is not configured.'
        );
      }

      if (!memberId) {
        throw new Error(
          'Member profile was not found.'
        );
      }

      const metrics = {
        active_users:
          form.active_users.trim(),
        yoy_arr:
          form.yoy_arr.trim(),
      };

      const cleanedServices =
        form.services
          .map((item) =>
            typeof item === 'string'
              ? item.trim()
              : item
          )
          .filter(Boolean);

      const cleanedCaseStudies =
        form.case_studies
          .map((item) =>
            typeof item === 'string'
              ? item.trim()
              : item
          )
          .filter(Boolean);

      const updates = {
        name: form.name.trim(),
        title: form.title.trim(),
        company_name:
          form.company_name.trim(),
        company_url:
          form.company_url.trim(),
        industry:
          form.industry.trim(),
        location:
          form.location.trim(),
        avatar_url:
          form.avatar_url.trim(),
        bio: form.bio.trim(),
        mission_vision:
          form.mission_vision.trim(),
        funding_stage:
          form.funding_stage.trim(),
        metrics,
        services: cleanedServices,
        case_studies:
          cleanedCaseStudies,
      };

      const { error: updateError } =
        await supabase
          .from('members')
          .update(updates)
          .eq('id', memberId);

      if (updateError) {
        throw updateError;
      }

      setSuccess(
        'Portfolio updated successfully.'
      );

      setTimeout(() => {
        navigate('/founder/portfolio');
      }, 1000);
    } catch (err) {
      console.error(
        'Failed to update portfolio:',
        err
      );

      setError(
        err?.message ||
          'Failed to update portfolio.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Edit Portfolio"
        subtitle="Update your executive profile"
      >
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="flex items-center gap-3 text-zinc-500">
            <Loader2
              size={22}
              className="animate-spin"
            />
            Loading portfolio...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Edit Portfolio"
      subtitle="Update your executive profile and dossier"
    >
      <div className="mx-auto max-w-5xl">
        {/* BACK */}
        <button
          type="button"
          onClick={() =>
            navigate('/founder/portfolio')
          }
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-amber-700 dark:text-zinc-400 dark:hover:text-amber-400"
        >
          <ArrowLeft size={17} />
          Back to My Portfolio
        </button>

        {/* SUCCESS */}
        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700 dark:border-green-900 dark:bg-green-950/20 dark:text-green-400">
            <CheckCircle2 size={21} />

            <p className="font-semibold">
              {success}
            </p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400">
            <AlertCircle
              size={21}
              className="mt-0.5"
            />

            <p>{error}</p>
          </div>
        )}

        <form
          onSubmit={handleSave}
          className="space-y-6"
        >
          {/* BASIC INFORMATION */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Basic Information
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Update the information displayed at
              the top of your portfolio.
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Founder Name
                </label>

                <input
                  value={form.name}
                  onChange={(e) =>
                    updateField(
                      'name',
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Tanisha Tanwar"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Title
                </label>

                <input
                  value={form.title}
                  onChange={(e) =>
                    updateField(
                      'title',
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="CEO & Founder"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Company Name
                </label>

                <input
                  value={form.company_name}
                  onChange={(e) =>
                    updateField(
                      'company_name',
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Your Company"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Company Website
                </label>

                <input
                  value={form.company_url}
                  onChange={(e) =>
                    updateField(
                      'company_url',
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="https://yourcompany.io"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Industry
                </label>

                <input
                  value={form.industry}
                  onChange={(e) =>
                    updateField(
                      'industry',
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="FinTech // Decentralized Protocols"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Location
                </label>

                <input
                  value={form.location}
                  onChange={(e) =>
                    updateField(
                      'location',
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="New York, NY"
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>
                  Profile Image URL
                </label>

                <input
                  value={form.avatar_url}
                  onChange={(e) =>
                    updateField(
                      'avatar_url',
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="https://..."
                />
              </div>
            </div>
          </section>

          {/* EXECUTIVE SUMMARY */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Executive Summary & Vision
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <label className={labelClass}>
                  Executive Summary
                </label>

                <textarea
                  rows={5}
                  value={form.bio}
                  onChange={(e) =>
                    updateField(
                      'bio',
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Describe your vision, what you are building, and why it matters..."
                />
              </div>

              <div>
                <label className={labelClass}>
                  Vision / Quote
                </label>

                <textarea
                  rows={4}
                  value={form.mission_vision}
                  onChange={(e) =>
                    updateField(
                      'mission_vision',
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="The best moat is relentless execution."
                />
              </div>
            </div>
          </section>

          {/* METRICS */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Business Metrics
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <div>
                <label className={labelClass}>
                  Funding Stage
                </label>

                <input
                  value={form.funding_stage}
                  onChange={(e) =>
                    updateField(
                      'funding_stage',
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Seed Round"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Active Users
                </label>

                <input
                  value={form.active_users}
                  onChange={(e) =>
                    updateField(
                      'active_users',
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="140K+"
                />
              </div>

              <div>
                <label className={labelClass}>
                  YoY ARR
                </label>

                <input
                  value={form.yoy_arr}
                  onChange={(e) =>
                    updateField(
                      'yoy_arr',
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="+210%"
                />
              </div>
            </div>
          </section>

          {/* SERVICES */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Product & Market Innovation
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Add your products, services or
                  innovation highlights.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  addListItem('services')
                }
                className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700"
              >
                <Plus size={16} />
                Add
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {form.services.length === 0 && (
                <p className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500 dark:bg-zinc-800">
                  No innovation items added yet.
                </p>
              )}

              {form.services.map(
                (item, index) => (
                  <div
                    key={index}
                    className="flex gap-3"
                  >
                    <input
                      value={
                        typeof item ===
                        'string'
                          ? item
                          : item?.title ||
                            ''
                      }
                      onChange={(e) =>
                        updateListItem(
                          'services',
                          index,
                          e.target.value
                        )
                      }
                      className={inputClass}
                      placeholder="Proprietary product moat and highlights"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeListItem(
                          'services',
                          index
                        )
                      }
                      className="rounded-xl border border-red-200 px-3 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                )
              )}
            </div>
          </section>

          {/* MILESTONES */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Key Milestones
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Add your important business
                  milestones.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  addListItem(
                    'case_studies'
                  )
                }
                className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700"
              >
                <Plus size={16} />
                Add
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {form.case_studies.length ===
                0 && (
                <p className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500 dark:bg-zinc-800">
                  No milestones added yet.
                </p>
              )}

              {form.case_studies.map(
                (item, index) => (
                  <div
                    key={index}
                    className="flex gap-3"
                  >
                    <input
                      value={
                        typeof item ===
                        'string'
                          ? item
                          : item?.title ||
                            ''
                      }
                      onChange={(e) =>
                        updateListItem(
                          'case_studies',
                          index,
                          e.target.value
                        )
                      }
                      className={inputClass}
                      placeholder="Protocol V1 Launch"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeListItem(
                          'case_studies',
                          index
                        )
                      }
                      className="rounded-xl border border-red-200 px-3 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                )
              )}
            </div>
          </section>

          {/* SAVE */}
          <div className="sticky bottom-4 flex justify-end rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-xl backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default EditPortfolio;