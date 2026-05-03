import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from "../../services/authService";
import useAuthStore from "../../store/useAuthStore";

const OTPVerify = ({ route, navigation }) => {
    const { registrationData, otp_id } = route.params;
    const [otp, setOtp] = useState('');
    const setAuth = useAuthStore((state) => state.setAuth);

    //---------------------------Final Register Handler-------------------------------------
    const handleFinalRegister = async () => {
        try {
            const finalData = { ...registrationData, otp, otp_id };
            const response = await authService.register(finalData);
            
            // Set global auth state
            setAuth(response.user, response.token); 
            
            Alert.alert("Successful", "Welcome to MULA Art Gallery!");
        }
        catch (error) {
            Alert.alert("Registration Failed", error.message || "Invalid OTP");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.inner}>
                
                {/*---------------------------Header------------------------------------- */}
                <View style={styles.header}>
                    <Image 
                        source={require('../../assets/logo/no_bg_logo.png')} 
                        style={styles.logo} 
                        resizeMode="contain"
                    />
                    <Text style={styles.brandTitle}>M U L A</Text>
                    <Text style={styles.brandSubtitle}>THE ART GALLERY</Text>
                    <Text style={styles.welcomeText}>Verify Account</Text>
                    <Text style={styles.instructionText}>
                        Please enter the 6-digit code sent to your phone.
                    </Text>
                </View>

                {/* ---------------------------OTP Input-------------------------------------  */}
                <View style={styles.inputSection}>
                    <Text style={styles.label}>Verification Code</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0 0 0 0 0 0"
                        placeholderTextColor="#999"
                        keyboardType="number-pad"
                        maxLength={6}
                        letterSpacing={10} // Added for better OTP visual spacing
                        textAlign="center"
                        onChangeText={setOtp}
                    />
                </View>

                {/*----------------------------Register Button-------------------------------------  */}
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={handleFinalRegister} 
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Complete Registration</Text>
                </TouchableOpacity>

                {/*----------------------------Resend Option-------------------------------------  */}
                <TouchableOpacity style={styles.resendBtn} onPress={() => Alert.alert("OTP Resent")}>
                    <Text style={styles.resendText}>
                        Didn't receive code? <Text style={styles.resendLink}>Resend</Text>
                    </Text>
                </TouchableOpacity>

                {/* Spacer to push everything up slightly */}
                <View style={{ flex: 1 }} />
                
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
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 40,
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
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: '600',
        color: '#A37E2C', // MULA Gold
    },
    instructionText: {
        fontSize: 14,
        color: '#777',
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 20,
        lineHeight: 20,
    },
    inputSection: {
        marginBottom: 30,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#444',
        marginBottom: 12,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#FFF',
        paddingVertical: 18,
        borderRadius: 12,
        fontSize: 24, // Larger font for OTP entry
        borderWidth: 1,
        borderColor: '#E8E2D0',
        color: '#1A1A1A',
        fontWeight: 'bold',
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
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
    },
    resendBtn: {
        marginTop: 25,
        alignItems: 'center',
    },
    resendText: {
        color: '#666',
        fontSize: 14,
    },
    resendLink: {
        color: '#A37E2C',
        fontWeight: '700',
    }
});

export default OTPVerify;