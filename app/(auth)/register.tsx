import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Card } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityWord, setSecurityWord] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const { register, isLoading, error } = useAuth();

  const handleRegister = async () => {
    if (!displayName.trim() || !email.trim() || !password || !securityWord.trim()) {
      return;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    setPasswordError('');
    try {
      await register(email.trim(), password, displayName.trim(), securityWord.trim());
    } catch {
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError && text.length >= 8) {
      setPasswordError('');
    }
  };

  const isValid = displayName.trim() && email.trim() && password.length >= 8 && securityWord.trim();

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logo}>
              <Ionicons name="heart-circle" size={48} color="#10B981" />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start your health journey today</Text>
          </View>

          <Card style={styles.card}>
            {error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Input
              label="Display Name"
              placeholder="Your name"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              testID="input-register-name"
            />

            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              testID="input-register-email"
            />

            <View style={styles.passwordContainer}>
              <Input
                label="Password"
                placeholder="Create a password (min 8 characters)"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                testID="input-register-password"
              />
              <TouchableOpacity 
                style={styles.showPassword}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                  color="#64748B" 
                />
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={styles.fieldError} testID="text-password-error">{passwordError}</Text>
            ) : null}

            <Input
              label="Security Word"
              placeholder="A secret word for account recovery"
              value={securityWord}
              onChangeText={setSecurityWord}
              autoCapitalize="none"
              testID="input-register-security-word"
            />
            <Text style={styles.securityHint}>
              Remember this word - you'll need it to recover your account if you forget your password.
            </Text>

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              disabled={!isValid}
              testID="button-register"
            />
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity testID="link-login">
                <Text style={styles.footerLink}>Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#E8F5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  card: {
    marginBottom: 24,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    flex: 1,
  },
  passwordContainer: {
    position: 'relative',
  },
  showPassword: {
    position: 'absolute',
    right: 16,
    top: 38,
  },
  fieldError: {
    fontSize: 13,
    color: '#EF4444',
    marginBottom: 8,
    marginTop: -4,
  },
  securityHint: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    marginTop: -8,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#64748B',
    fontSize: 16,
  },
  footerLink: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
});
