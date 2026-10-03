import React from 'react';
import { MarketTickerBar } from '../layout/MarketTickerBar';
import { useData } from '../../context/DataContext';

export const StockTicker = () => {
  const { marketTickers, isLoading } = useData();

  if (isLoading || !marketTickers || marketTickers.length === 0) {
    return null;
  }

  return <MarketTickerBar tickers={marketTickers} />;
};

export default StockTicker;
