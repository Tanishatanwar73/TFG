import React from 'react';
import { AdvertisementBanner } from '../layout/AdvertisementBanner';
import { useData } from '../../context/DataContext';

export const AdBanner = ({
  slot = 'top_leaderboard',
  className = '',
}) => {
  const { ads, isLoading: loading } = useData();
  const ad = ads.find((item) => item.slot === slot) || null;

  if (loading) return null;

  if (!ad) {
    return null;
  }

  return (
    <div className={`my-4 ${className}`}>
      <AdvertisementBanner
        ad={ad}
        slot={slot}
      />
    </div>
  );
};

export default AdBanner;