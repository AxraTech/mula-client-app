import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet } from "react-native";
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
        <View style={styles.container}>
{/*---------------------------Text Inputs------------------------------------- */}
            <TextInput placeholder="Full Name" onChangeText={(txt) => setForm({...form, fullname: txt})} />
            <TextInput placeholder="09xxxxxxxxx" keyboardType="phone-pad" onChangeText={(txt) => setForm({...form, phone: txt})} />
            <TextInput placeholder="password" secureTextEntry onChangeText={(txt) => setForm({...form, password: txt})} />
            <TextInput placeholder="YYYY-MM-DD" onChangeText={(txt) => setForm({...form, dob: txt})} />

{/* ---------------------------Send OTP Button------------------------------------- */}
            <Button title="Send OTP" onPress={handleSendOTP} />
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

export default Signup;