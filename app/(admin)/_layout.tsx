import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { storage } from '@/services/storage';
import type { User } from '@/types';

export default function AdminLayout() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const token = await storage.getToken();
        if (!token) {
          router.replace('/(auth)/login');
          return;
        }

        const userData = await storage.getUser<User>();
        if (!userData || userData.role !== 'admin') {
          router.replace('/(main)/home');
          return;
        }
      } catch {
        router.replace('/(auth)/login');
      } finally {
        setIsChecking(false);
      }
    };
    checkAdminAuth();
  }, []);

  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
