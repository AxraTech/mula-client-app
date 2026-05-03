import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from "../../services/authService";

const Signup = ({ navigation }) => {
    const [form, setForm] = useState({
        phone: '',
        password: '',
        fullname: '',
        dob: '',
        gender: 'male',
    });

    //---------------------------Send OTP Handler-------------------------------------
    const handleSendOTP = async () => {
        try {
            const data = await authService.requestOTP(form.phone);
            navigation.navigate('otpVerify', {
                registrationData: form,
                otp_id: data.otp_id,
            });
        }
        catch (error) {
            Alert.alert("Error", error.message || "Failed to send OTP.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.inner}>
                
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/*---------------------------Header------------------------------------- */}
                    <View style={styles.header}>
                        <Image 
                            source={require('../../assets/logo/no_bg_logo.png')} 
                            style={styles.logo} 
                            resizeMode="contain"
                        />
                        <Text style={styles.brandTitle}>M U L A</Text>
                        <Text style={styles.brandSubtitle}>THE ART GALLERY</Text>
                        <Text style={styles.welcomeText}>Create Account</Text>
                    </View>

                    {/*---------------------------Text Inputs------------------------------------- */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="Enter your full name" 
                            placeholderTextColor="#999"
                            onChangeText={(txt) => setForm({...form, fullname: txt})} 
                        />

                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="09xxxxxxxxx" 
                            placeholderTextColor="#999"
                            keyboardType="phone-pad" 
                            onChangeText={(txt) => setForm({...form, phone: txt})} 
                        />

                        <Text style={styles.label}>Password</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="Create a password" 
                            placeholderTextColor="#999"
                            secureTextEntry 
                            onChangeText={(txt) => setForm({...form, password: txt})} 
                        />

                        <Text style={styles.label}>Date of Birth</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="YYYY-MM-DD" 
                            placeholderTextColor="#999"
                            onChangeText={(txt) => setForm({...form, dob: txt})} 
                        />
                    </View>

                    {/* ---------------------------Send OTP Button------------------------------------- */}
                    <TouchableOpacity style={styles.button} onPress={handleSendOTP} activeOpacity={0.8}>
                        <Text style={styles.buttonText}>Send OTP</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('login')}>
                        <Text style={styles.loginBtnText}>
                            Already have an account? <Text style={styles.loginLink}>Login</Text>
                        </Text>
                    </TouchableOpacity>

                    {/* Spacer to push content up slightly and handle keyboard */}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F5EB', // MULA Warm Cream
    },
    inner: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        flexGrow: 1,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logo: {
        width: 70,
        height: 70,
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
        color: '#A37E2C', // MULA Gold
    },
    inputSection: {
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#444',
        marginBottom: 6,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        fontSize: 15,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E8E2D0',
        color: '#1A1A1A',
    },
    button: {
        backgroundColor: '#A37E2C', // MULA Gold
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginTop: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
    },
    loginBtn: {
        marginTop: 25,
        alignItems: 'center',
    },
    loginBtnText: {
        color: '#666',
        fontSize: 14,
    },
    loginLink: {
        color: '#A37E2C',
        fontWeight: '700',
    }
});

export default Signup;