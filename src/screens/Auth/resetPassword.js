import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from "../../services/authService";

const ResetPassword = ({ route, navigation }) => {
    const { phone, otp_id } = route.params;
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    //---------------------------Reset Password Handler-------------------------------------
    const handleResetPassword = async () => {
        try {
            await authService.resetPassword(phone, otp, otp_id, newPassword);
            Alert.alert("Success", "Password Updated! Please log in with your new password.");
            navigation.navigate('login');
        } catch (error) {
            Alert.alert("Reset password failed", error.message);
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
                    <Text style={styles.welcomeText}>Reset Password</Text>
                    <Text style={styles.instructionText}>
                        Enter the code sent to your device and choose a new secure password.
                    </Text>
                </View>

                <View style={styles.inputSection}>
                    {/*---------------------------OTP Input-------------------------------------  */}
                    <Text style={styles.label}>Verification Code</Text>
                    <TextInput
                        style={[styles.input, styles.otpInput]}
                        placeholder="0 0 0 0 0 0"
                        placeholderTextColor="#999"
                        keyboardType="number-pad"
                        maxLength={6}
                        onChangeText={setOtp}
                    />

                    {/*---------------------------New Password Input-------------------------------------  */}
                    <Text style={styles.label}>New Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter new password"
                        placeholderTextColor="#999"
                        secureTextEntry
                        onChangeText={setNewPassword}
                    />
                </View>

                {/*---------------------------Reset Password Button-------------------------------------  */}
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={handleResetPassword} 
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Update Password</Text>
                </TouchableOpacity>

                {/* Spacer to balance the layout */}
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
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E8E2D0',
        color: '#1A1A1A',
    },
    otpInput: {
        textAlign: 'center',
        letterSpacing: 8,
        fontSize: 20,
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
    }
});

export default ResetPassword;