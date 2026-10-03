import { getSupabase } from '../../lib/supabase/client';
import { MarketTickerItem } from '../../types';

export const marketTickerService = {
  async getTickers(): Promise<MarketTickerItem[] | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('market_tickers')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error || !data) {
        console.warn('Supabase market ticker fetch error:', error?.message);
        return null;
      }

      return data.map((row: any): MarketTickerItem => ({
        id: row.id,
        symbol: row.symbol,
        name: row.name,
        price: row.price,
        change: row.change,
        isPositive: row.is_positive,
        isIndianIndex: row.is_indian_index
      }));
    } catch (error) {
      console.error('Error fetching market tickers from Supabase:', error);
      return null;
    }
  }
};