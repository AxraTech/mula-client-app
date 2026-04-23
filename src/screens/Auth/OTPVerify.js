import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet } from "react-native";
import { authService } from "../../services/authService";
import useAuthStore from "../../store/useAuthStore";

const OTPVerify = ({ route, navigation }) => {
    const { registrationData, otp_id } = route.params;
    //console.log("params:", params);
    const [otp, setOtp] = useState('');
    const setAuth = useAuthStore((state) => state.setAuth);

//---------------------------Final Register Handler-------------------------------------
    const handleFinalRegister = async () => {
        try {
            const finalData = { ...registrationData, otp, otp_id };
            const response = await authService.register(finalData);
            setAuth(response.user, response.token); //-------------save user and token to global state-----
            Alert.alert("Successful", "Account created!");
        }
        catch (error) {
            Alert.alert("Registration Failed", error.message);
        }
    };

    return (
        <View style={styles.container}>
{/* ---------------------------OTP Input-------------------------------------  */}
            <TextInput
                placeholder="Enter 6-degits OTP"
                keyboardType="number-pad"
                onChangeText={setOtp}
            />
{/*----------------------------Register Button-------------------------------------  */}
            <Button
                style={styles.registerButton}
                title="Register"
                onPress={handleFinalRegister}
            />
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        marginTop: 50,
    },
    registerButton: {
    },
});

export default OTPVerify;