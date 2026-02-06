import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Input, ConfirmDialog } from '@/components/ui';
import { storage } from '@/services/storage';
import { api } from '@/services/api';
import type { User } from '@/types';

export default function AccountScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [showDeleteSuccessDialog, setShowDeleteSuccessDialog] = useState(false);
  const [showDeleteErrorDialog, setShowDeleteErrorDialog] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await storage.getUser<User>();
    if (userData) {
      setUser(userData);
      setDisplayName(userData.displayName);
      setEmail(userData.email);
    }
  };

  const handleSave = () => {
    router.back();
  };

  const handleSignOut = () => {
    setShowSignOutDialog(true);
  };

  const confirmSignOut = async () => {
    setShowSignOutDialog(false);
    await api.logout();
    router.replace('/(auth)/login');
  };

  const handleDeleteAccount = () => {
    setShowDeleteDialog(true);
  };

  const proceedToFinalDelete = () => {
    setShowDeleteDialog(false);
    setShowDeleteConfirmDialog(true);
  };

  const confirmDeleteAccount = async () => {
    setShowDeleteConfirmDialog(false);
    try {
      await api.request('/api/account', { method: 'DELETE', body: { confirmEmail: email } });
      setShowDeleteSuccessDialog(true);
    } catch (error) {
      setShowDeleteErrorDialog(true);
    }
  };

  const handleDeleteSuccess = async () => {
    setShowDeleteSuccessDialog(false);
    await api.logout();
    router.replace('/(auth)/login');
  };

  const handleChangePassword = () => {
    router.push('/(auth)/forgot-password');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.title}>Account Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {displayName?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </View>

        <Input
          label="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
          testID="input-display-name"
        />

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          testID="input-email"
        />

        <TouchableOpacity style={styles.passwordLink} onPress={handleChangePassword} testID="button-change-password">
          <Text style={styles.passwordLinkText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color="#10B981" />
        </TouchableOpacity>

        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>Account Actions</Text>
          
          <TouchableOpacity 
            style={styles.signOutButton}
            onPress={handleSignOut}
            testID="button-sign-out"
          >
            <Ionicons name="log-out-outline" size={20} color="#64748B" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            testID="button-delete-account"
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Save Changes"
          onPress={handleSave}
          testID="button-save-account"
        />
      </View>

      <ConfirmDialog
        visible={showSignOutDialog}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        cancelText="Cancel"
        onConfirm={confirmSignOut}
        onCancel={() => setShowSignOutDialog(false)}
        destructive
      />

      <ConfirmDialog
        visible={showDeleteDialog}
        title="Delete Account"
        message="Are you sure you want to delete your account? This will permanently remove all your data."
        confirmText="Continue"
        cancelText="Cancel"
        onConfirm={proceedToFinalDelete}
        onCancel={() => setShowDeleteDialog(false)}
        destructive
      />

      <ConfirmDialog
        visible={showDeleteConfirmDialog}
        title="Final Confirmation"
        message="This action CANNOT be undone. All your health data, logs, and account information will be permanently deleted within 30 days."
        confirmText="Delete Forever"
        cancelText="Cancel"
        onConfirm={confirmDeleteAccount}
        onCancel={() => setShowDeleteConfirmDialog(false)}
        destructive
      />

      <ConfirmDialog
        visible={showDeleteSuccessDialog}
        title="Account Deleted"
        message="Your account deletion has been scheduled. You will receive a confirmation email. Your data will be permanently removed within 30 days."
        confirmText="OK"
        cancelText="Close"
        onConfirm={handleDeleteSuccess}
        onCancel={handleDeleteSuccess}
        destructive={false}
      />

      <ConfirmDialog
        visible={showDeleteErrorDialog}
        title="Error"
        message="We couldn't process your request right now. Please try again or contact support."
        confirmText="OK"
        cancelText="Close"
        onConfirm={() => setShowDeleteErrorDialog(false)}
        onCancel={() => setShowDeleteErrorDialog(false)}
        destructive={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5F0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  passwordLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginTop: 8,
  },
  passwordLinkText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '500',
  },
  dangerSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    marginBottom: 12,
  },
  signOutText: {
    fontSize: 16,
    color: '#374151',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
  },
  deleteText: {
    fontSize: 16,
    color: '#EF4444',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
});
