import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, TextInput, TouchableOpacity, 
    ScrollView, ActivityIndicator, Alert, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../../store/useAuthStore';
import { updateProfile } from '../../services/authService';

const EditProfileScreen = ({ navigation, route }) => {
    const { token } = useAuthStore();
    const existingData = route.params?.profileData || {};

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        fullname: existingData.fullname || '',
        email: existingData.email || '',
        gender: existingData.gender || 'male',
        dob: existingData.dob || '',
        address: existingData.address || '',
        profile_image_url: existingData.profile_image_url || ''
    });

    const handleSave = async () => {
        if (!form.fullname || !form.email) {
            Alert.alert("Required", "Fullname and Email are required.");
            return;
        }

        setLoading(true);
        try {
            await updateProfile(token, form);
            Alert.alert("Success", "Profile updated successfully!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error("Update Error:", error);
            Alert.alert("Error", "Failed to update profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const InputField = ({ label, value, onChange, placeholder, keyboardType = 'default' }) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                placeholderTextColor="#AAA"
                keyboardType={keyboardType}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtn}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator size="small" color="#A37E2C" />
                    ) : (
                        <Text style={styles.saveBtn}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
                <InputField 
                    label="Full Name" 
                    value={form.fullname} 
                    onChange={(val) => setForm({...form, fullname: val})} 
                    placeholder="Htet Phyo Aung"
                />
                <InputField 
                    label="Email Address" 
                    value={form.email} 
                    onChange={(val) => setForm({...form, email: val})} 
                    placeholder="example@gmail.com"
                    keyboardType="email-address"
                />
                
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.genderRow}>
                        {['male', 'female', 'other'].map((g) => (
                            <TouchableOpacity 
                                key={g}
                                style={[styles.genderBtn, form.gender === g && styles.activeGender]}
                                onPress={() => setForm({...form, gender: g})}
                            >
                                <Text style={[styles.genderText, form.gender === g && styles.activeGenderText]}>
                                    {g.charAt(0).toUpperCase() + g.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <InputField 
                    label="Date of Birth" 
                    value={form.dob} 
                    onChange={(val) => setForm({...form, dob: val})} 
                    placeholder="DD-MM-YYYY"
                />
                <InputField 
                    label="Address" 
                    value={form.address} 
                    onChange={(val) => setForm({...form, address: val})} 
                    placeholder="Mandalay"
                />
                <InputField 
                    label="Profile Image URL" 
                    value={form.profile_image_url} 
                    onChange={(val) => setForm({...form, profile_image_url: val})} 
                    placeholder="https://..."
                />

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F5EB' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E8E2D0',
    },
    backBtn: { fontSize: 35, color: '#333' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
    saveBtn: { fontSize: 16, fontWeight: 'bold', color: '#A37E2C' },
    body: { padding: 20 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 13, color: '#888', marginBottom: 8, fontWeight: '600', letterSpacing: 0.5 },
    input: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E8E2D0',
        fontSize: 15,
        color: '#1A1A1A',
    },
    genderRow: { flexDirection: 'row', justifyContent: 'space-between' },
    genderBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E8E2D0',
        backgroundColor: '#FFF',
        marginHorizontal: 4,
    },
    activeGender: { borderColor: '#A37E2C', backgroundColor: '#A37E2C10' },
    genderText: { color: '#666', fontWeight: '500' },
    activeGenderText: { color: '#A37E2C', fontWeight: 'bold' },
});

export default EditProfileScreen;