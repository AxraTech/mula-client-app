import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet} from "react-native";
import { authService } from "../../services/authService";

const ResetPassword = ({ route, navigation }) => {
    const { phone, otp_id } = route.params;
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

//---------------------------Reset Password Handler-------------------------------------
    const handleResetPassword = async () => {
        try {
            await authService.resetPassword( phone, otp, otp_id, newPassword );
            Alert.alert("Success", "Password Updated! Please log in with your new password.");
            navigation.navigate('login');
        } catch (error) {
            Alert.alert("Reset password failed", error.message);
        }
    };

    return (
        <View style={styles.container}>
{/*---------------------------OTP Input-------------------------------------  */}
            <TextInput
                placeholder="Enter 6-digits OTP"
                keyboardType="number-pad"
                onChangeText={setOtp}
            />
{/*---------------------------New Password Input-------------------------------------  */}
            <TextInput
                placeholder="Enter new password"
                secureTextEntry
                onChangeText={setNewPassword}
            />
{/*---------------------------Reset Password Button-------------------------------------  */}
            <Button
                style={styles.resetButton}
                title="Reset Password"
                onPress={handleResetPassword}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        marginTop: 50,
    },
    resetButton: {
    },
});

export default ResetPassword;