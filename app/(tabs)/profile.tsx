import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { storage } from '@/services/storage';
import type { User } from '@/types';

const SETTINGS_OPTIONS = [
  { id: 'account', title: 'Account Settings', icon: 'person-outline', route: '/(main)/settings/account' },
  { id: 'privacy', title: 'Privacy & Sharing', icon: 'lock-closed-outline', route: '/(main)/settings/sharing' },
  { id: 'notifications', title: 'Notifications', icon: 'notifications-outline', route: '/(main)/settings/notifications' },
  { id: 'health', title: 'Health Connections', icon: 'heart-outline', route: '/(main)/settings/connections' },
  { id: 'help', title: 'Help & Instructions', icon: 'help-circle-outline', route: '/(tabs)/instructions' },
];

const ADMIN_OPTION = { id: 'admin', title: 'Admin Dashboard', icon: 'shield-checkmark', route: '/(admin)' };

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await storage.getUser<User>();
    setUser(userData);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.displayName?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.displayName || 'User'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {user?.role === 'admin' ? 'Administrator' : 'Athlete'}
            </Text>
          </View>
        </View>

        {user?.role === 'admin' ? (
          <TouchableOpacity 
            testID="button-admin-dashboard"
            onPress={() => router.push('/(admin)' as never)}
            style={styles.adminCard}
          >
            <Card style={styles.adminCardInner}>
              <View style={styles.adminIcon}>
                <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.adminInfo}>
                <Text style={styles.adminTitle}>Admin Dashboard</Text>
                <Text style={styles.adminDesc}>Manage app, users, and AI agents</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
            </Card>
          </TouchableOpacity>
        ) : null}

        <View style={styles.settings}>
          {SETTINGS_OPTIONS.map((option) => (
            <TouchableOpacity 
              key={option.id} 
              testID={`button-settings-${option.id}`}
              onPress={() => option.route ? router.push(option.route as never) : null}
            >
              <Card style={styles.settingCard}>
                <Ionicons name={option.icon as never} size={24} color="#64748B" />
                <Text style={styles.settingTitle}>{option.title}</Text>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Sign Out"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
          testID="button-logout"
        />

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#E8F5F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  settings: {
    gap: 8,
    marginBottom: 24,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  logoutButton: {
    marginBottom: 16,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 24,
  },
  adminCard: {
    marginBottom: 16,
  },
  adminCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  adminIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminInfo: {
    flex: 1,
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B21B6',
  },
  adminDesc: {
    fontSize: 12,
    color: '#7C3AED',
    marginTop: 2,
  },
});
