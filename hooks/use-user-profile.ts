'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useSession } from './use-session';
import { Big } from 'big.js';

export interface UserProfile {
  id: number;
  supabaseId: string;
  firstName: string;
  lastName: string;
  nickName?: string | null;
  email: string;
  phone?: string | null;
  balance: Big;
  status: 'ACTIVE' | 'BANNED';
  role: 'ADMIN' | 'PLAYER';
  freePlayCount?: number | null;
  createdAt: string;
  updatedAt: string;
}

export type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message?: string;
  error?: string;
  errors?: Record<string, string>;
  path?: string;
  data?: T;
  timestamp?: string;
};

async function fetchUserProfile(accessToken: string): Promise<UserProfile | undefined> {
  const res = await fetch(`/api/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error('Failed to fetch profile');

  const data: ApiResponse<UserProfile> = await res.json();


  return data.data; // may be undefined
}


export function useUserProfile(): UseQueryResult<UserProfile | undefined, Error> {
  const { user, session, loading } = useSession();

  return useQuery<UserProfile | undefined, Error>({
    queryKey: ['userProfile', user?.id],
    queryFn: async (): Promise<UserProfile | undefined> => {
      // ensure fetchUserProfile returns UserProfile
      return await fetchUserProfile(session!.access_token);
    },
    enabled: !!user && !loading,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}


