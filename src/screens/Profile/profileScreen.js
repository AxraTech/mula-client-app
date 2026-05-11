import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../../store/useAuthStore';
import { authService } from '../../services/authService';

const ProfileScreen = ({ navigation }) => {
    const { user, token, logout } = useAuthStore();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await authService.getProfile(token);
            setProfileData(data.user);
        } catch (error) {
            console.error("Profile Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout(); // This will trigger the navigator to switch to AuthStack
    };

    const MenuItem = ({ title, subtitle, icon, onPress }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>{title}</Text>
                {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
            <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>
    );

    if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#A37E2C" />;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarInitial}>
                            {profileData?.fullname?.charAt(0) || 'U'}
                        </Text>
                    </View>
                    <Text style={styles.userName}>{profileData?.fullname || 'MULA Member'}</Text>
                    <Text style={styles.userPhone}>{profileData?.phone || user?.phone}</Text>
                    <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('editProfile', { profileData })}>
                        <Text style={styles.editBtnText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Account Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Account Settings</Text>
                    <MenuItem 
                        title="Order History" 
                        subtitle="Track your purchases" 
                        onPress={() => navigation.navigate('orderHistory')} 
                    />
                    <MenuItem 
                        title="My Wishlist" 
                        subtitle="Artworks you love" 
                        onPress={() => navigation.navigate('favoriteList')} 
                    />
                    <MenuItem 
                        title="Shipping Address" 
                        onPress={() => {}} 
                    />
                </View>

                {/* Support & Legal */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Information</Text>
                    <MenuItem title="Privacy Policy" onPress={() => {}} />
                    <MenuItem title="Terms of Service" onPress={() => {}} />
                    <MenuItem title="Contact MULA Gallery" onPress={() => {}} />
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutBtnText}>Logout</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 1.0.0 (mulaApp)</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F5EB' },
    header: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E8E2D0',
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#A37E2C',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatarInitial: {
        fontSize: 32,
        color: '#FFF',
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
        fontFamily: Platform.OS === 'ios' ? 'Optima' : 'serif',
    },
    userPhone: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
    editBtn: {
        marginTop: 15,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#A37E2C',
    },
    editBtnText: {
        color: '#A37E2C',
        fontSize: 12,
        fontWeight: 'bold',
    },
    section: {
        marginTop: 25,
        paddingHorizontal: 20,
    },
    sectionLabel: {
        fontSize: 12,
        color: '#AAA',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 10,
        marginLeft: 5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 18,
        borderRadius: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E8E2D0',
    },
    menuInfo: { flex: 1 },
    menuTitle: { fontSize: 16, color: '#333', fontWeight: '500' },
    menuSubtitle: { fontSize: 12, color: '#999', marginTop: 2 },
    arrowIcon: { fontSize: 24, color: '#CCC' },
    logoutBtn: {
        margin: 30,
        paddingVertical: 18,
        borderRadius: 15,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#FF4757',
        alignItems: 'center',
    },
    logoutBtnText: {
        color: '#FF4757',
        fontSize: 16,
        fontWeight: 'bold',
    },
    versionText: {
        textAlign: 'center',
        color: '#BBB',
        fontSize: 11,
        marginBottom: 40,
    }
});

export default ProfileScreen;