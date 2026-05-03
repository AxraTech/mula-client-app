import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
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
            const user = response.user || { id: 'authenticated_user' }; 

            if (token) {
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
                style={styles.inner}>
                
                {/*---------------------------header------------------------------------- */}
                <View style={styles.header}>
                    {/* Ensure your logo path is correct */}
                    <Image 
                        source={require('../../assets/logo/no_bg_logo.png')} 
                        style={styles.logo} 
                        resizeMode="contain"
                    />
                    <Text style={styles.brandTitle}>M U L A</Text>
                    <Text style={styles.brandSubtitle}>THE ART GALLERY</Text>
                    <Text style={styles.welcomeText}>Welcome Back</Text>
                </View>

                {/*---------------------------Text Inputs------------------------------------- */}
                <View style={styles.inputSection}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='09xxxxxxxxx'
                        placeholderTextColor="#999"
                        keyboardType='phone-pad'
                        value={phoneNumber}
                        onChangeText={setPhoneNumber} />
                    
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='......'
                        placeholderTextColor="#999"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword} />

                    {/*---------------------------Forget Password------------------------------------- */}
                    <TouchableOpacity style={styles.forgetBtn} onPress={handleForgetPassword}>
                        <Text style={styles.forgetBtnText}>Forget Password?</Text>
                    </TouchableOpacity>
                </View>

                {/*---------------------------Login Button------------------------------------- */}
                <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.8}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                {/*---------------------------Sign Up------------------------------------- */}
                <TouchableOpacity style={styles.signupBtn} onPress={handleSignup}>
                    <Text style={styles.signupBtnText}>
                        Don't have an account? <Text style={styles.signupLink}>Sign Up</Text>
                    </Text>
                </TouchableOpacity>
                
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F5EB', // MULA Warm Cream base from gallery UI
    },
    inner: {
        flex: 1,
        marginTop: 40,
        padding: 24,
        //justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 10,
    },
    brandTitle: {
        fontSize: 28,
        letterSpacing: 6,
        fontWeight: '300',
        color: '#1A1A1A',
        fontFamily: Platform.OS === 'ios' ? 'Optima' : 'serif',
    },
    brandSubtitle: {
        fontSize: 10,
        letterSpacing: 2,
        color: '#666',
        marginTop: 4,
        marginBottom: 15,
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#A37E2C', // MULA Gold accent from Checkout buttons
    },
    inputSection: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#444',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E8E2D0', // Subtle border color from Checkout forms
        color: '#1A1A1A',
    },
    button: {
        backgroundColor: '#A37E2C', // MULA Primary Gold/Olive from IMG-e5dcef88cbc071a7bdc5ea9fd8438890-V_2.jpg
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
    },
    forgetBtn: {
        alignSelf: 'flex-end',
        marginTop: -8,
        padding: 4,
    },
    forgetBtnText: {
        color: '#666',
        fontSize: 13,
    },
    signupBtn: {
        marginTop: 25,
        alignItems: 'center',
    },
    signupBtnText: {
        color: '#666',
        fontSize: 14,
    },
    signupLink: {
        color: '#A37E2C',
        fontWeight: '700',
    }
});

export default Login;