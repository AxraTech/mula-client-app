import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';
import useAuthStore from '../../store/useAuthStore';

const Login = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');

    const setAuth = useAuthStore((state) => state.setAuth);

//---------------------------Login Handler-------------------------------------
    const handleLogin = async () => {
        try {
            const response = await authService.login(phoneNumber, password);
            console.log("Full Login Response:", response);

            const token = response.accessToken; 
            
            // The API returns { error, message, accessToken } but NO 'user' object.
            // We will create a simple object to satisfy the store.
            const user = response.user || { id: 'authenticated_user' }; 

            if (token) {
                // This will now trigger the navigation because isAuthenticated becomes true
                await setAuth(user, token); 
                console.log("Login successful: State updated");
            } else {
                console.log("Error: accessToken not found");
            }
        } catch (error) {
            console.log("Login Error:", error);
            Alert.alert("Login Failed", error.message || "Check your credentials");
        }
    };

//---------------------------Forget Password Handler-------------------------------------
    const handleForgetPassword = () => {
      navigation.navigate('forgetPassword');
    };

//---------------------------Sign Up Handler-------------------------------------
    const handleSignup = () => {
      navigation.navigate('signup');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.innerContainer}>
{/*---------------------------header------------------------------------- */}
                    <View style={styles.header}>
                        <Text style={styles.title}>MULA</Text>
                    </View>
{/*---------------------------Text Inputs------------------------------------- */}
                    <View style={styles.innerContainer}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder='09xxxxxxxxx'
                            keyboardType='phone-pad'
                            value={phoneNumber}
                            onChangeText={setPhoneNumber} />
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder='......'
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword} />
                    </View>
{/*---------------------------Login Button------------------------------------- */}
                    <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.8}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
{/*---------------------------Forget Password------------------------------------- */}
                    <TouchableOpacity style={styles.forgetBtn} onPress={handleForgetPassword}>
                        <Text style={styles.forgetBtnText}>Forget Password?</Text>
                    </TouchableOpacity>
{/*---------------------------Sign Up------------------------------------- */}
                    <TouchableOpacity style={styles.signupBtn} onPress={handleSignup}>
                        <Text style={styles.signupBtnText}>Don't have an account? Sign Up</Text>
                    </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2d3436',
  },
  subtitle: {
    fontSize: 16,
    color: '#636e72',
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  button: {
    backgroundColor: '#2d3436',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  forgetBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  forgetBtnText: {
    color: '#0984e3',
    fontWeight: '600',
  },
  signupBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  signupBtnText: {
    color: '#0984e3',
    fontWeight: '600',
  }
});

export default Login;