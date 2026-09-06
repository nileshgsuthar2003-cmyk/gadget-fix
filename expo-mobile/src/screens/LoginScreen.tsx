import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator, Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wrench, Mail, Lock, Eye, EyeOff, X, KeyRound, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { RootStackScreenProps } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function LoginScreen({ navigation }: RootStackScreenProps<'Login'>) {
  const { theme, isDark } = useTheme();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password via Email OTP States
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }

    const res = await login(email.trim(), password);
    if (res.success) {
      navigation.replace('Tabs', { screen: 'Home' });
    } else {
      Alert.alert('Login Failed', res.error || 'Invalid email or password.');
    }
  };

  // 1. Send OTP to Email
  const handleSendOtp = async () => {
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.sendForgotOtp(forgotEmail.trim());
      if (res && res.success) {
        setForgotStep(2);
        Alert.alert(
          'Verification Code Sent',
          `A 6-digit OTP code has been sent to ${forgotEmail.trim()}.`
        );
      } else {
        Alert.alert('Error', res?.error || 'Could not send verification code.');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to send OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async () => {
    if (!forgotOtp.trim() || forgotOtp.trim().length < 4) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit code sent to your email.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.verifyForgotOtp(forgotEmail.trim(), forgotOtp.trim());
      if (res && res.success) {
        setForgotStep(3);
      } else {
        Alert.alert('Verification Failed', res?.error || 'Invalid or expired OTP code.');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to verify OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  // 3. Reset to New Password
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Password Too Short', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.resetPasswordWithOtp({
        email: forgotEmail.trim(),
        otp: forgotOtp.trim(),
        password: newPassword,
      });

      if (res && res.success) {
        Alert.alert('🎉 Password Reset!', 'Your password has been reset successfully. Logging you in...');
        
        const loginRes = await login(forgotEmail.trim(), newPassword);
        
        setIsForgotModalOpen(false);
        setForgotStep(1);
        setForgotOtp('');
        
        if (loginRes.success) {
          navigation.replace('Tabs', { screen: 'Home' });
        } else {
          Alert.alert('Login Failed', loginRes.error || 'Please sign in with your new password.');
          setEmail(forgotEmail.trim());
          setPassword(newPassword);
        }
        
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Reset Failed', res?.error || 'Could not reset password.');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to reset password.');
    } finally {
      setForgotLoading(false);
    }
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
            Sign in with your registered email or mobile number and password to book and track your phone repairs.
          </Text>

          <View style={styles.formContainer}>
            {/* Email Field */}
            <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
              <Mail size={20} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: theme.text }]}
                placeholder="Email or Mobile Number"
                placeholderTextColor={theme.textMuted}
                keyboardType="default"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
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
                editable={!isLoading}
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
                (!isFormValid || isLoading) && styles.buttonDisabled
              ]} 
              onPress={handleLogin}
              disabled={!isFormValid || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Footer Links */}
            <View style={styles.footerRow}>
              <TouchableOpacity onPress={() => {
                setForgotEmail(email.trim());
                setForgotStep(1);
                setIsForgotModalOpen(true);
              }}>
                <Text style={[styles.footerLink, { color: theme.textSecondary }]}>Forgot Password?</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.footerLink, { color: theme.primary }]}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flex: 1, minHeight: 40 }} />
          <Text style={[styles.termsText, { color: theme.textMuted }]}>
            By continuing you agree to Cell Care's <Text style={{ color: theme.primary }}>Terms</Text> and <Text style={{ color: theme.primary }}>Privacy Policy</Text>.
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ---------- FORGOT PASSWORD MODAL (EMAIL OTP) ---------- */}
      <Modal visible={isForgotModalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={styles.modalBackdrop}
        >
          <View style={[styles.modalBox, { backgroundColor: theme.surface }]}>
            
            {/* Modal Header */}
            <View style={styles.modalTopBar}>
              <View>
                <Text style={[styles.modalHeading, { color: theme.text }]}>
                  {forgotStep === 1 && 'Forgot Password'}
                  {forgotStep === 2 && 'Enter Verification Code'}
                  {forgotStep === 3 && 'Create New Password'}
                </Text>
                <Text style={[styles.modalSubheading, { color: theme.textSecondary }]}>
                  {forgotStep === 1 && 'Step 1 of 3: Enter your registered email'}
                  {forgotStep === 2 && `Step 2 of 3: Code sent to ${forgotEmail}`}
                  {forgotStep === 3 && 'Step 3 of 3: Set your new password'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsForgotModalOpen(false)}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            {/* STEP 1: Enter Email */}
            {forgotStep === 1 && (
              <View style={styles.modalBody}>
                <View style={[styles.inputWrapper, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
                  <Mail size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: theme.text }]}
                    placeholder="Enter registered email"
                    placeholderTextColor={theme.textMuted}
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.modalActionBtn, { backgroundColor: theme.primary }, forgotLoading && { opacity: 0.6 }]}
                  onPress={handleSendOtp}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalActionBtnText}>Send Verification Code</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 2: Enter OTP */}
            {forgotStep === 2 && (
              <View style={styles.modalBody}>
                <View style={[styles.inputWrapper, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
                  <KeyRound size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: theme.text, letterSpacing: 4, fontWeight: '800', fontSize: 16 }]}
                    placeholder="6-digit OTP"
                    placeholderTextColor={theme.textMuted}
                    value={forgotOtp}
                    onChangeText={setForgotOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.modalActionBtn, { backgroundColor: theme.primary }, forgotLoading && { opacity: 0.6 }]}
                  onPress={handleVerifyOtp}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalActionBtnText}>Verify Code & Continue</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handleSendOtp}
                  disabled={forgotLoading}
                  style={{ alignSelf: 'center', marginTop: 10 }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.primary }}>
                    Resend Code
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 3: Set New Password */}
            {forgotStep === 3 && (
              <View style={styles.modalBody}>
                <View style={[styles.inputWrapper, { backgroundColor: theme.background, borderColor: theme.cardBorder, marginBottom: 10 }]}>
                  <Lock size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: theme.text }]}
                    placeholder="New password (min 6 chars)"
                    placeholderTextColor={theme.textMuted}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                  />
                </View>

                <View style={[styles.inputWrapper, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
                  <Lock size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: theme.text }]}
                    placeholder="Confirm new password"
                    placeholderTextColor={theme.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.modalActionBtn, { backgroundColor: theme.primary }, forgotLoading && { opacity: 0.6 }]}
                  onPress={handleResetPassword}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalActionBtnText}>Reset Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

          </View>
        </KeyboardAvoidingView>
      </Modal>

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
    justifyContent: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 32,
  },
  formContainer: {
    gap: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 4,
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    paddingBottom: 36,
  },
  modalTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalHeading: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalSubheading: {
    fontSize: 12,
    marginTop: 2,
  },
  modalBody: {
    gap: 12,
    paddingTop: 6,
  },
  modalActionBtn: {
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  modalActionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  debugOtpBanner: {
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  debugOtpText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
