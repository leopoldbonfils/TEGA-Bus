import { useAuth } from '@/context/AuthContext';
import { loginUser } from '@/services/authService';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import { Checkbox } from 'expo-checkbox';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetVisible, setResetVisible] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '1088153516882-jub92ho1phia1ombjlpio105hoda5fou.apps.googleusercontent.com',
    androidClientId: '1088153516882-h79vhjmlrd87enpbg0kbkvvi2tcv2dr4.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      fetchGoogleUser(response.authentication.accessToken);
    }
  }, [response]);

  const fetchGoogleUser = async (accessToken: string) => {
    try {
      const result = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profile = await result.json();
      login(
        {
          id: profile.id,
          name: profile.name || profile.email,
          email: profile.email,
          role: 'passenger',
          avatarUri: profile.picture || null,
        },
        accessToken
      );
      router.replace('/(tabs)');
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Google Sign-In failed', text2: error.message });
    }
  };

  const handleAppleSignIn = async () => {
    try {
      if (!(await AppleAuthentication.isAvailableAsync())) {
        Alert.alert('Not available', 'Apple Sign-In is only available on supported Apple devices.');
        return;
      }
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const name = [credential.fullName?.givenName, credential.fullName?.familyName]
        .filter(Boolean)
        .join(' ') || 'Apple User';
      login(
        {
          id: credential.user,
          name,
          email: credential.email || 'Apple account',
          role: 'passenger',
        },
        credential.identityToken || credential.user
      );
      router.replace('/(tabs)');
    } catch (error: any) {
      if (error.code !== 'ERR_REQUEST_CANCELED') {
        Toast.show({ type: 'error', text1: 'Apple Sign-In failed', text2: error.message });
      }
    }
  };

  const handleForgotPassword = () => {
    const normalizedEmail = resetEmail.trim().toLowerCase();
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(normalizedEmail)) {
      Toast.show({ type: 'error', text1: 'Enter a valid email address' });
      return;
    }
    setResetVisible(false);
    setResetEmail('');
    Alert.alert('Reset link requested', `If an account exists for ${normalizedEmail}, reset instructions will be sent there.`);
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Email is required',
      });
      return;
    }

    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Invalid email address',
      });
      return;
    }

    if (!password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Password is required',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser({
        email: email.trim().toLowerCase(),
        password: password,
      });

      // ....Save user in context.....
      if (response.user) {
        login(response.user, response.token);
      }

      Toast.show({
        type: 'success',
        text1: `Welcome, ${response.user?.name || ''}!`,
        text2: 'Login successful',
        position: 'top',
      });

      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1000);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Login failed',
        text2: error.message || 'Failed to login',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/BusImage/logo.png')} style={styles.logoImage} />
        <View style={styles.textAccount}>
          <Text style={styles.textName}>Welcome Back</Text>
          <Text style={styles.shortText}>Sign in to continue your journey</Text>
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Email Address</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
          <TextInput style={styles.textField} placeholderTextColor="#999" placeholder="Enter your email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail}/>
        </View>

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
          <TextInput style={styles.textField} placeholderTextColor="#999" placeholder="Enter your password" secureTextEntry={!showPassword} value={password} onChangeText={setPassword}/>
          <TouchableOpacity style={styles.eyeIcon} onPress={()=> setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#999"/>
          </TouchableOpacity>
        </View>

        <View style={styles.rememberRow}>
          <View style={styles.rememberLeft}>
            <Checkbox style={styles.checkbox} value={isChecked} onValueChange={setIsChecked} color={isChecked ? '#007AFF' : undefined}/>
            <Text style={styles.rememberText}>Remember me</Text>
          </View>
          <TouchableOpacity onPress={() => setResetVisible(true)}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={[styles.loginBtn, loading && styles.loginBtnDisabled]} disabled={loading} onPress={handleLogin}>
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.loginBtnText}>LOGIN</Text>
        )}
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialBtn} disabled={!request} onPress={() => promptAsync()}>
          <Image source={require('../assets/BusImage/google.png')} style={styles.googleImage}/>
          <Text style={styles.socialText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn} onPress={handleAppleSignIn}>
          <FontAwesome name="apple" size={22} color="#000" />
          <Text style={styles.socialText}>Apple</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.registerRow}>
        <Text style={styles.registerText}>{"Don't have an account?"}</Text>
        <TouchableOpacity onPress={()=> router.push('/register')}>
          <Text style={styles.registerLink}>Register</Text>
        </TouchableOpacity>
      </View>

      {resetVisible && (
        <View style={styles.resetOverlay}>
          <View style={styles.resetCard}>
            <Text style={styles.resetTitle}>Forgot password?</Text>
            <Text style={styles.resetDescription}>Enter your email and we will help you reset your password.</Text>
            <TextInput
              style={styles.resetInput}
              placeholder="Email address"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={resetEmail}
              onChangeText={setResetEmail}
            />
            <View style={styles.resetActions}>
              <TouchableOpacity onPress={() => setResetVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resetButton} onPress={handleForgotPassword}>
                <Text style={styles.resetButtonText}>Send link</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FA',
    padding: 28,
    justifyContent: 'center',
  },

  header: {
    alignItems: 'center',
    marginBottom: 28,
  },

  logoImage: {
    width: 110,
    height: 110,
    borderRadius: 20,
    marginBottom: 16,
  },

  textAccount: {
    alignItems: 'center',
  },

  textName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 6,
  },

  shortText: {
    fontSize: 14,
    color: '#666',
  },

  form: {
    width: '100%',
    gap: 8,
    marginBottom: 20,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    marginTop: 8,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: 52,
  },

  inputIcon: {
    marginRight: 10,
  },

  textField: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },

  eyeIcon: {
    paddingLeft: 8,
  },

  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },

  rememberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },

  rememberText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 6,
  },

  forgotText: {
    fontSize: 14,
    color: '#0D2B6B',
    fontWeight: '600',
  },

  loginBtn: {
    backgroundColor: '#0D2B6B',
    borderRadius: 10,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },

  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },

  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 28,
  },

  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    height: 50,
    backgroundColor: '#fff',
    gap: 8,
  },

  socialText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },

  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  registerText: {
    fontSize: 14,
    color: '#555',
  },

  registerLink: {
    fontSize: 14,
    color: '#0D2B6B',
    fontWeight: 'bold',
  },
  
  googleImage:{
    width:21,
    height:20
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  resetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 30, 63, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  resetCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 22,
  },
  resetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#12213D',
  },
  resetDescription: {
    color: '#667085',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 18,
  },
  resetInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 10,
    paddingHorizontal: 14,
    color: '#12213D',
  },
  resetActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 18,
    marginTop: 20,
  },
  cancelText: {
    color: '#667085',
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#0D2B6B',
    borderRadius: 9,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
})
