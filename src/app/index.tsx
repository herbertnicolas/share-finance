import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { getUserGroup } from '@/lib/groups';

export default function RootIndex() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasGroup, setHasGroup] = useState(false);

  useEffect(() => {
    checkUserStatus();

    // Escuta mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsAuthenticated(true);
        checkUserGroup(session.user.id);
      } else {
        setIsAuthenticated(false);
        setHasGroup(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkUserStatus() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      setIsAuthenticated(true);
      await checkUserGroup(session.user.id);
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }

  async function checkUserGroup(userId: string) {
    const group = await getUserGroup(userId);
    setHasGroup(!!group);
    setLoading(false);
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-sf-bg">
        <ActivityIndicator size="large" color="#00809D" />
      </View>
    );
  }

  // Não autenticado -> Login
  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  // Autenticado sem grupo -> Onboarding
  if (!hasGroup) {
    return <Redirect href="/onboarding" />;
  }

  // Autenticado com grupo -> Home
  return <Redirect href="/(tabs)" />;
}
