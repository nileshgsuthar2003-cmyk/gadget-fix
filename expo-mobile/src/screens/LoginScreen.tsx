import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wrench, Mail, Lock, Eye, EyeOff, Smartphone } from 'lucide-react-native';
import { RootStackScreenProps } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';

export default function LoginScreen({ navigation }: RootStackScreenProps<'Login'>) {
  const { theme, isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }
    navigation.replace('Tabs', { screen: 'Home' });
  };

  const isFormValid = email.trim().length > 3 && password.length >= 4;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          
          <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
            <Wrench size={28} color="#ffffff" strokeWidth={2.5} />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Sign in with your email and password to book and track your phone repairs.
          </Text>

          <View style={styles.formContainer}>
            {/* Email Field */}
            <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
              <Mail size={20} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: theme.text }]}
                placeholder="Email address"
                placeholderTextColor={theme.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password Field */}
            <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
              <Lock size={20} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: theme.text }]}
                placeholder="Password"
                placeholderTextColor={theme.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)} 
                style={styles.eyeBtn}
              >
                {showPassword ? (
                  <EyeOff size={20} color={theme.textMuted} />
                ) : (
                  <Eye size={20} color={theme.textMuted} />
                )}
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity 
              style={[
                styles.primaryButton, 
                { backgroundColor: theme.primary },
                !isFormValid && styles.buttonDisabled
              ]} 
              onPress={handleLogin}
              disabled={!isFormValid}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
              <Text style={[styles.dividerText, { color: theme.textMuted }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
            </View>

            {/* Google Sign In */}
            <TouchableOpacity 
              style={[styles.secondaryButton, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
              onPress={() => navigation.replace('Tabs', { screen: 'Home' })}
              activeOpacity={0.8}
            >
              <Smartphone size={18} color={theme.text} style={{ marginRight: 8 }} />
              <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Footer Links */}
            <View style={styles.footerRow}>
              <TouchableOpacity onPress={() => Alert.alert('Forgot Password', 'Password reset instructions have been sent to your email.')}>
                <Text style={[styles.footerLink, { color: theme.textSecondary }]}>Forgot Password?</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.footerLink, { color: theme.primary }]}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flex: 1, minHeight: 40 }} />
          <Text style={[styles.termsText, { color: theme.textMuted }]}>
            By continuing you agree to Fixly's <Text style={{ color: theme.primary }}>Terms</Text> and <Text style={{ color: theme.primary }}>Privacy Policy</Text>.
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 32,
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  eyeBtn: {
    padding: 4,
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '500',
  },
  secondaryButton: {
    height: 52,
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 20,
  }
});
