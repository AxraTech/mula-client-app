import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button, Alert } from "react-native";
import { mediaService } from "../../services/mediaService";
import useAuthStore from "../../store/useAuthStore";

const MediaScreen = () => {
    const [videos, setVideos] = useState([]);
    const user = useAuthStore(state => state.user);

    useEffect(() => {
        mediaService.getVideos().then(setVideos);
    }, []);

    const handleFollow = async (creatorId) => {
        try {
            await mediaService.followCreator(creatorId, user.id);
            Alert.alert("Success", "You are now following this creator!");
        }
        catch (error) {
            Alert.alert("Error", "Failed to follow creator.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Videos</Text>
            <FlatList
                data={videos}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.videosItem}>
                        <Text>{item.title}</Text>
                        <Button title="Follow" onPress={() => handleFollow(item.fk_video_creator_id)} />
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 50,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    videosItem: {
        padding: 20,
        borderBottomWidth: 1,
    },
});

export default MediaScreen;