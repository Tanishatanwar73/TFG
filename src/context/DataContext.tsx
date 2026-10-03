import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

import {
  FounderMember,
  NewsArticle,
  ChatMessage,
  Advertisement,
  VisitorInquiry,
  AutomatedEmailNotification,
  MarketTickerItem
} from '../types';

import { isSupabaseConfigured } from '../lib/supabase/client';

import {
  membersService,
  articlesService,
  chatService,
  adsService,
  inquiriesService,
  notificationsService
} from '../services/supabase';

const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), timeoutMs)),
  ]);

interface DataContextType {
  isSupabaseLive: boolean;
  isLoading: boolean;

  members: FounderMember[];
  newsArticles: NewsArticle[];
  chatMessages: ChatMessage[];
  ads: Advertisement[];
  inquiries: VisitorInquiry[];
  emailNotifications: AutomatedEmailNotification[];
  marketTickers: MarketTickerItem[];
  error: string | null;

  setMembers: React.Dispatch<
    React.SetStateAction<FounderMember[]>
  >;

  setNewsArticles: React.Dispatch<
    React.SetStateAction<NewsArticle[]>
  >;

  setChatMessages: React.Dispatch<
    React.SetStateAction<ChatMessage[]>
  >;

  setAds: React.Dispatch<
    React.SetStateAction<Advertisement[]>
  >;

  setInquiries: React.Dispatch<
    React.SetStateAction<VisitorInquiry[]>
  >;

  setEmailNotifications: React.Dispatch<
    React.SetStateAction<AutomatedEmailNotification[]>
  >;

  refreshAllFromSupabase: () => Promise<void>;
}

const DataContext = createContext<
  DataContextType | undefined
>(undefined);

export const DataProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isSupabaseLive, setIsSupabaseLive] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [members, setMembers] =
    useState<FounderMember[]>([]);

  const [newsArticles, setNewsArticles] =
    useState<NewsArticle[]>([]);

  const [chatMessages, setChatMessages] =
    useState<ChatMessage[]>([]);

  const [ads, setAds] =
    useState<Advertisement[]>([]);

  const [inquiries, setInquiries] =
    useState<VisitorInquiry[]>([]);

  const [emailNotifications, setEmailNotifications] =
    useState<AutomatedEmailNotification[]>([]);

  const [marketTickers, setMarketTickers] =
    useState<MarketTickerItem[]>([]);

  const refreshAllFromSupabase = async () => {
    /*
     * -----------------------------------------
     * CHECK SUPABASE CONFIGURATION
     * -----------------------------------------
     */

    if (!isSupabaseConfigured()) {
      setIsSupabaseLive(false);
      setIsLoading(false);

      setError(
        'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      );

      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      /*
       * -----------------------------------------
       * LOAD SUPABASE DATA
       * -----------------------------------------
       */

      const [
        remoteMembers,
        remoteNews,
        remoteChat,
        remoteAds,
        remoteInquiries,
        remoteNotifs
      ] = await Promise.all([
        withTimeout(membersService.getAllMembers(), 8000, null),
        withTimeout(articlesService.getNewsArticles(), 8000, null),
        withTimeout(chatService.getMessages(), 8000, null),
        withTimeout(adsService.getAds(), 8000, null),
        withTimeout(inquiriesService.getInquiries(), 8000, null),
        withTimeout(notificationsService.getNotifications(), 8000, null)
      ]);

      /*
       * -----------------------------------------
       * IDENTIFY FAILED SUPABASE SERVICES
       * -----------------------------------------
       */

      const failedResources = [
        {
          name: 'Members',
          data: remoteMembers
        },
        {
          name: 'News Articles',
          data: remoteNews
        },
        {
          name: 'Chat Messages',
          data: remoteChat
        },
        {
          name: 'Advertisements',
          data: remoteAds
        },
        {
          name: 'Visitor Inquiries',
          data: remoteInquiries
        },
        {
          name: 'Email Notifications',
          data: remoteNotifs
        }
      ]
        .filter(
          (resource) =>
            resource.data === null
        )
        .map(
          (resource) => resource.name
        );

      /*
       * -----------------------------------------
       * SHOW EXACT SUPABASE ERROR
       * -----------------------------------------
       */

      if (failedResources.length > 0) {
        const message =
          `Supabase failed to load: ${failedResources.join(', ')}`;

        console.error(message);

        setError(message);
      } else {
        setError(null);
      }

      /*
       * -----------------------------------------
       * UPDATE MEMBERS
       * -----------------------------------------
       */

      if (remoteMembers) {
        setMembers(remoteMembers);
      }

      /*
       * -----------------------------------------
       * UPDATE NEWS
       * -----------------------------------------
       */

      if (remoteNews) {
        setNewsArticles(remoteNews);
      }

      /*
       * -----------------------------------------
       * UPDATE CHAT
       * -----------------------------------------
       */

      if (remoteChat) {
        setChatMessages(remoteChat);
      }

      /*
       * -----------------------------------------
       * UPDATE ADS
       * -----------------------------------------
       */

      if (remoteAds) {
        setAds(remoteAds);
      }

      /*
       * -----------------------------------------
       * UPDATE INQUIRIES
       * -----------------------------------------
       */

      if (remoteInquiries) {
        setInquiries(remoteInquiries);
      }

      /*
       * -----------------------------------------
       * UPDATE NOTIFICATIONS
       * -----------------------------------------
       */

      if (remoteNotifs) {
        setEmailNotifications(
          remoteNotifs
        );
      }

      /*
       * -----------------------------------------
       * STOCK MARKET API
       * -----------------------------------------
       *
       * React calls:
       *
       * /api/stocks
       *
       * Your server.js calls Alpha Vantage.
       */

      let remoteTickers: MarketTickerItem[] = [];

      try {
        const stockResponse =
          await fetch(
            'http://localhost:3000/api/stocks'
          );

        if (!stockResponse.ok) {
          throw new Error(
            `Stock API request failed: ${stockResponse.status}`
          );
        }

        const stockData =
          await stockResponse.json();

        if (
          Array.isArray(stockData)
        ) {
          remoteTickers =
            stockData;
        } else if (
          Array.isArray(
            stockData.tickers
          )
        ) {
          remoteTickers =
            stockData.tickers;
        } else if (
          Array.isArray(
            stockData.data
          )
        ) {
          remoteTickers =
            stockData.data;
        }

        console.log(
          'Stock API data:',
          remoteTickers
        );
      } catch (stockError) {
        console.error(
          'Could not load stock data:',
          stockError
        );

        remoteTickers = [];
      }

      /*
       * -----------------------------------------
       * UPDATE STOCK DATA
       * -----------------------------------------
       */

      setMarketTickers(
        remoteTickers
      );

      /*
       * -----------------------------------------
       * SUPABASE STATUS
       * -----------------------------------------
       */

      setIsSupabaseLive(
        failedResources.length === 0
      );

      console.log(
        'Application data loading completed.'
      );

      console.log(
        'Supabase failed resources:',
        failedResources
      );

      console.log(
        'Members:',
        remoteMembers
          ? remoteMembers.length
          : 'FAILED'
      );

      console.log(
        'News:',
        remoteNews
          ? remoteNews.length
          : 'FAILED'
      );

      console.log(
        'Chat:',
        remoteChat
          ? remoteChat.length
          : 'FAILED'
      );

      console.log(
        'Ads:',
        remoteAds
          ? remoteAds.length
          : 'FAILED'
      );

      console.log(
        'Inquiries:',
        remoteInquiries
          ? remoteInquiries.length
          : 'FAILED'
      );

      console.log(
        'Notifications:',
        remoteNotifs
          ? remoteNotifs.length
          : 'FAILED'
      );

      console.log(
        'Stocks:',
        remoteTickers.length
      );
    } catch (err) {
      /*
       * -----------------------------------------
       * GENERAL ERROR
       * -----------------------------------------
       */

      console.error(
        'Could not load data:',
        err
      );

      setError(
        'Unable to load application data from Supabase.'
      );

      setIsSupabaseLive(false);
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * -----------------------------------------
   * LOAD DATA WHEN APP STARTS
   * -----------------------------------------
   */

  useEffect(() => {
    refreshAllFromSupabase();
  }, []);

  /*
   * -----------------------------------------
   * PROVIDER
   * -----------------------------------------
   */

  return (
    <DataContext.Provider
      value={{
        isSupabaseLive,
        isLoading,

        members,
        newsArticles,
        chatMessages,
        ads,
        inquiries,
        emailNotifications,
        marketTickers,
        error,

        setMembers,
        setNewsArticles,
        setChatMessages,
        setAds,
        setInquiries,
        setEmailNotifications,

        refreshAllFromSupabase
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

/*
 * -----------------------------------------
 * USE DATA HOOK
 * -----------------------------------------
 */

export const useData = () => {
  const context =
    useContext(DataContext);

  if (!context) {
    throw new Error(
      'useData must be used within a DataProvider'
    );
  }

  return context;
};