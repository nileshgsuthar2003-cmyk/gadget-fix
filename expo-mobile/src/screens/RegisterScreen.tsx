import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wrench, User, Mail, Lock, Eye, EyeOff, ChevronDown, X } from 'lucide-react-native';
import { RootStackScreenProps } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }: RootStackScreenProps<'Register'>) {
  const { theme, isDark } = useTheme();
  const { registerSendOtp, registerVerifyOtp, isLoading } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start the 30-second resend cooldown
  const startCooldown = useCallback(() => {
    setResendCooldown(30);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'Please enter your first and last name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }
    if (phone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    const res = await registerSendOtp({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
    });

    if (res.success) {
      setShowOtpModal(true);
      setOtp('');
      startCooldown();
    } else {
      Alert.alert('Registration Failed', res.error || 'Unable to send verification code.');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    const res = await registerVerifyOtp({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      otp,
    });
    setIsVerifying(false);

    if (res.success) {
      setShowOtpModal(false);
      Alert.alert(
        'Account Created! 🎉',
        `Welcome to Cell Care, ${firstName}! Your account is now active.`,
        [{ text: 'Get Started', onPress: () => navigation.replace('Tabs', { screen: 'Home' }) }]
      );
    } else {
      Alert.alert('Verification Failed', res.error || 'Invalid OTP.');
    }
  };

  const isFormValid = 
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 1 &&
    email.trim().length > 3 &&
    phone.length === 10 &&
    password.length >= 6 &&
    password === confirmPassword;

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

          <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Join Cell Care to book, manage, and track your mobile phone repairs instantly.
          </Text>

          <View style={styles.formContainer}>
            
            {/* First Name & Last Name Row */}
            <View style={styles.nameRow}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: 8, backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                <User size={18} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { color: theme.text }]}
                  placeholder="First Name"
                  placeholderTextColor={theme.textMuted}
                  value={firstName}
                  onChangeText={setFirstName}
                  editable={!isLoading}
                />
              </View>
              <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8, backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                <TextInput
                  style={[styles.textInput, { color: theme.text }]}
                  placeholder="Last Name"
                  placeholderTextColor={theme.textMuted}
                  value={lastName}
                  onChangeText={setLastName}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Email Address */}
            <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
              <Mail size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: theme.text }]}
                placeholder="Email address"
                placeholderTextColor={theme.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
              />
            </View>

            {/* Phone Number */}
            <View style={styles.phoneInputWrapper}>
              <View style={[styles.countryCode, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                <Text style={[styles.countryCodeText, { color: theme.text }]}>+91</Text>
                <ChevronDown size={16} color={theme.textSecondary} />
              </View>
              <TextInput
                style={[styles.phoneTextInput, { backgroundColor: theme.surface, borderColor: theme.cardBorder, color: theme.text }]}
                placeholder="Mobile number"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
                maxLength={10}
                value={phone}
                onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
                editable={!isLoading}
              />
            </View>

            {/* Password */}
            <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
              <Lock size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: theme.text }]}
                placeholder="Password (min 6 characters)"
                placeholderTextColor={theme.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                {showPassword ? (
                  <EyeOff size={18} color={theme.textMuted} />
                ) : (
                  <Eye size={18} color={theme.textMuted} />
                )}
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
              <Lock size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: theme.text }]}
                placeholder="Confirm password"
                placeholderTextColor={theme.textMuted}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn}>
                {showConfirmPassword ? (
                  <EyeOff size={18} color={theme.textMuted} />
                ) : (
                  <Eye size={18} color={theme.textMuted} />
                )}
              </TouchableOpacity>
            </View>

            {/* Register Button */}
            <TouchableOpacity 
              style={[
                styles.primaryButton, 
                { backgroundColor: theme.primary },
                (!isFormValid || isLoading) && styles.buttonDisabled
              ]} 
              onPress={handleRegister}
              disabled={!isFormValid || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Register</Text>
              )}
            </TouchableOpacity>

            {/* Footer Row */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.footerLink, { color: theme.primary }]}>Sign In</Text>
              </TouchableOpacity>
            </View>

          </View>

          <View style={{ height: 24 }} />
          <Text style={[styles.termsText, { color: theme.textMuted }]}>
            By registering you agree to Cell Care's{' '}
            <Text onPress={() => navigation.navigate('Terms')} style={{ color: theme.primary }}>Terms</Text> and{' '}
            <Text onPress={() => navigation.navigate('Privacy')} style={{ color: theme.primary }}>Privacy Policy</Text>.
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* OTP Verification Modal */}
      <Modal visible={showOtpModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <View style={[styles.modalBox, { backgroundColor: theme.surface }]}>
              {/* Modal Header */}
              <View style={styles.modalTopBar}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={[styles.modalHeading, { color: theme.text }]}>
                    Verification Required
                  </Text>
                  <Text style={[styles.modalSubheading, { color: theme.textSecondary }]}>
                    We've sent a 6-digit code to {email}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowOtpModal(false)} style={styles.closeIconBtn}>
                  <X size={20} color={theme.textMuted} />
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={[styles.otpInput, { color: theme.text, backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}
                placeholder="Enter 6-digit OTP"
                placeholderTextColor={theme.textMuted}
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
              />

              <TouchableOpacity 
                style={[
                  styles.primaryButton, 
                  { width: '100%', backgroundColor: theme.primary },
                  (isVerifying || otp.length !== 6) && { opacity: 0.5 },
                ]} 
                onPress={handleVerifyOtp}
                disabled={isVerifying || otp.length !== 6}
              >
                {isVerifying ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Verify & Create Account</Text>
                )}
              </TouchableOpacity>

              {/* Resend OTP */}
              <View style={styles.resendRow}>
                <Text style={[styles.resendLabel, { color: theme.textMuted }]}>Didn't receive the code? </Text>
                {resendCooldown > 0 ? (
                  <Text style={[styles.resendTimer, { color: theme.textMuted }]}>
                    Resend in {resendCooldown}s
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleRegister} disabled={isVerifying}>
                    <Text style={[styles.resendLink, { color: theme.primary }]}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => { setShowOtpModal(false); setOtp(''); }}
                disabled={isVerifying}
              >
                <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
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
    paddingTop: 40,
    paddingBottom: 24,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 14,
    marginRight: 10,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  phoneTextInput: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  eyeBtn: {
    padding: 4,
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    marginRight: 6,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
  },
  modalBox: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 20,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubheading: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  closeIconBtn: {
    padding: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },
  otpInput: {
    width: '100%',
    height: 56,
    borderWidth: 1,
    borderRadius: 14,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 20,
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  resendLabel: {
    fontSize: 13,
  },
  resendTimer: {
    fontSize: 13,
    fontWeight: '700',
  },
  resendLink: {
    fontSize: 13,
    fontWeight: '700',
  },
});
