import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wrench, User, Mail, Lock, Eye, EyeOff, ChevronDown } from 'lucide-react-native';
import { RootStackScreenProps } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';

export default function RegisterScreen({ navigation }: RootStackScreenProps<'Register'>) {
  const { theme, isDark } = useTheme();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = () => {
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

    Alert.alert(
      'Account Created',
      `Welcome to Fixly, ${firstName}! Your account has been registered successfully.`,
      [{ text: 'Get Started', onPress: () => navigation.replace('Tabs', { screen: 'Home' }) }]
    );
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
            Join Fixly to book, manage, and track your mobile phone repairs instantly.
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
                />
              </View>
              <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8, backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                <TextInput
                  style={[styles.textInput, { color: theme.text }]}
                  placeholder="Last Name"
                  placeholderTextColor={theme.textMuted}
                  value={lastName}
                  onChangeText={setLastName}
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
                !isFormValid && styles.buttonDisabled
              ]} 
              onPress={handleRegister}
              disabled={!isFormValid}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Register</Text>
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
            By registering you agree to Fixly's <Text style={{ color: theme.primary }}>Terms</Text> and <Text style={{ color: theme.primary }}>Privacy Policy</Text>.
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
  }
});
