import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from "../../services/authService";

const ForgetPassword = ({ navigation }) => {
    const [phone, setPhone] = useState('');

    //---------------------------Request OTP Handler-------------------------------------
    const handleRequestOTP = async () => {
        try {
            const data = await authService.requestForgetPasswordOTP(phone);
            navigation.navigate('resetPassword', {
                phone,
                otp_id: data.otp_id,
            });
        } catch (error) {
            Alert.alert("Error", error.message || "User not found");
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
                    <Text style={styles.welcomeText}>Forgot Password?</Text>
                    <Text style={styles.instructionText}>
                        Enter your registered phone number to receive a recovery code.
                    </Text>
                </View>

                {/*---------------------------Phone Input-------------------------------------  */}
                <View style={styles.inputSection}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="09xxxxxxxxx"
                        placeholderTextColor="#999"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                    />
                </View>

                {/*---------------------------Request OTP Button-------------------------------------  */}
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={handleRequestOTP} 
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Send Reset Code</Text>
                </TouchableOpacity>

                {/*---------------------------Back to Login-------------------------------------  */}
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtnText}>
                        Remember your password? <Text style={styles.backLink}>Login</Text>
                    </Text>
                </TouchableOpacity>

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
        marginTop: 60,
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
        marginTop: 12,
        paddingHorizontal: 20,
        lineHeight: 20,
    },
    inputSection: {
        marginBottom: 25,
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
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
    },
    backBtn: {
        marginTop: 25,
        alignItems: 'center',
    },
    backBtnText: {
        color: '#666',
        fontSize: 14,
    },
    backLink: {
        color: '#A37E2C',
        fontWeight: '700',
    }
});

export default ForgetPassword;