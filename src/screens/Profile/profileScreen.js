import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { profileService } from "../../services/profileService";

const ProfileScreen = () => {
    const [profile, setProfile] = useState(null);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        profileService.getProfile().then(setProfile);
    }, []);

    const handleUpdate = async () => {
        const updated = await profileService.updateProfile({ fullname: newName });
        setProfile(updated);
        setNewName('');
    };

    return (
        <View style={styles.container}>
            <Text>Current Name: {profile?.fullname}</Text>
            <Text>Phone: {profile?.phone}</Text>

            <TextInput 
                placeholder="Enter new name"
                value={newName}
                onChangeText={setNewName}
                style={styles.input}
            />
            <Button title="Update Profile" onPress={handleUpdate} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    input: {
        borderBottomWidth: 1,
        marginVertical: 20,
    },
});

export default ProfileScreen;