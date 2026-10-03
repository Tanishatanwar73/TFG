import React, { useEffect, useState } from 'react';
import {
  Megaphone,
  ExternalLink,
  Plus,
  Eye,
  MousePointer
} from 'lucide-react';
import { Button } from '../common/Button';
import { adsService } from '../../services/supabase/adsService';

export const AdManager = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const data = await adsService.getAds();

        setAds(data || []);
      } catch (error) {
        console.error(
          'Error fetching advertisements from Supabase:',
          error
        );

        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Advertisement & Sponsorship Placements
          </h3>

          <p className="text-xs text-zinc-500">
            Configure partner banners across leaderboard, sidebar, and in-feed positions.
          </p>
        </div>

        <Button
          size="sm"
          variant="gold"
          icon={Plus}
        >
          New Sponsor Campaign
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-56 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && ads.length === 0 && (
        <div className="py-12 text-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl">
          <Megaphone className="w-8 h-8 mx-auto text-zinc-400 mb-3" />

          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No advertisements found.
          </p>
        </div>
      )}

      {/* Ads */}
      {!loading && ads.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3"
            >

              {/* Slot + Status */}
              <div className="flex items-center justify-between text-xs">

                <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                  Slot: {ad.slot}
                </span>

                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  ● Active
                </span>

              </div>

              {/* Ad information */}
              <div className="space-y-1">

                <div className="text-[11px] font-mono text-zinc-400 uppercase">
                  Sponsor: {ad.sponsor}
                </div>

                <h4 className="font-serif text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {ad.title}
                </h4>

                <p className="text-xs text-zinc-500 leading-relaxed">
                  {ad.description}
                </p>

              </div>

              {/* Statistics */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">

                <div className="flex items-center gap-3">

                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {ad.impressions || 0} imp
                  </span>

                  <span className="flex items-center gap-1">
                    <MousePointer className="w-3.5 h-3.5" />
                    {ad.ctr || 0}% CTR
                  </span>

                </div>

                <Button
                  size="sm"
                  variant="outline"
                >
                  Edit Placement
                </Button>

              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default AdManager;