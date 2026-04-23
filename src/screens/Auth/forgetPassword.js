import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet } from "react-native";
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
        <View style={styles.container}>
{/*---------------------------Phone Input-------------------------------------  */}
            <TextInput
                placeholder="09xxxxxxxxx"
                keyboardType="phone-pad"
                onChangeText={setPhone}
            />
{/*---------------------------Request OTP Button-------------------------------------  */}
            <Button
                title="Send Reset Code"
                onPress={handleRequestOTP}
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
});

export default ForgetPassword;