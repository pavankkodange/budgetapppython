import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  profile_picture_url?: string;
  created_at: string;
  updated_at: string;
}

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  createProfile: (profileData: Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        // Log the error details for debugging
        console.error('Profile fetch error:', {
          code: fetchError.code,
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint,
        });

        if (fetchError.code === 'PGRST116') {
          // No profile found - create one with OAuth data
          console.log('No profile found, creating with OAuth data...');

          // Extract data from auth user
          const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
          const userEmail = user.email || '';
          const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';

          try {
            const { data: newProfile, error: createError } = await supabase
              .from('user_profiles')
              .insert({
                user_id: user.id,
                name: userName,
                email: userEmail,
                avatar_url: avatarUrl,
              })
              .select()
              .single();

            if (createError) {
              console.error('Error creating profile:', createError);
              setProfile(null);
              setError(null);
            } else {
              console.log('Profile created successfully:', newProfile);
              setProfile(newProfile);
            }
          } catch (err) {
            console.error('Failed to create profile:', err);
            setProfile(null);
            setError(null);
          }
        } else if (fetchError.message?.includes('406')) {
          // Handle 406 errors gracefully - likely a schema/config issue
          console.warn('User profiles table may not be properly configured. Skipping profile fetch.');
          setProfile(null);
          setError(null);
        } else {
          throw fetchError;
        }
      } else {
        // Profile found - update with latest OAuth data if available
        const userName = user.user_metadata?.full_name || user.user_metadata?.name;
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

        const needsUpdate = (userName && data.name !== userName) || (avatarUrl && data.avatar_url !== avatarUrl);

        if (needsUpdate) {
          console.log('Updating profile with latest OAuth data...');
          const updates: any = {};
          if (userName && data.name !== userName) updates.name = userName;
          if (avatarUrl && data.avatar_url !== avatarUrl) updates.avatar_url = avatarUrl;

          const { data: updated } = await supabase
            .from('user_profiles')
            .update(updates)
            .eq('user_id', user.id)
            .select()
            .single();

          setProfile(updated || data);
        } else {
          setProfile(data);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Don't set error state for 406 errors to avoid blocking the UI
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      if (!errorMessage.includes('406')) {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user || !profile) {
      throw new Error('No user or profile found');
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setProfile(data);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData: Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      throw new Error('No user found');
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          ...profileData,
          user_id: user.id,
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      setProfile(data);
    } catch (err) {
      console.error('Error creating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to create profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setError(null);
    }
  }, [user]);

  const value: ProfileContextType = {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    createProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};