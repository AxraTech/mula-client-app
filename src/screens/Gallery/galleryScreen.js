import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { galleryService } from "../../services/galleryService";

const GalleryScreen = () => {
    const [traditional, setTraditional] = useState([]);
    const [digital, setDigital] = useState([]);

    useEffect(() => {
        galleryService.getTraditionalArtworks().then(setTraditional);
        galleryService.getDigitalArtworks().then(setDigital);
    }, []);

    const renderArtItem = ({ item }) => (
        <TouchableOpacity style={styles.renderArtItem}>
            <Text style={{ frontWeight: 'bold' }}>{item.title || 'Untitled'}</Text>
            <Text>Price: {item.price || 'N/A'}</Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.ArtNameTitle}>Traditional Artworks</Text>
            <FlatList
                data={traditional}
                renderItem={renderArtItem}
                keyExtractor={i => i.id.toString()} scrollEnabled={false}
            />
            <Text style={styles.ArtNameTitle}>Digital Artworks</Text>
            <FlatList
                data={digital}
                renderItem={renderArtItem}
                keyExtractor={i => i.id.toString()} scrollEnabled={false}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    renderArtItem: {
        padding: 15, 
        borderBottomWidth: 1, 
        borderColor: '#ccc',
    },
    container: {
        flex: 1,
        marginTop: 50,
    },
    ArtNameTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        padding: 10,
    },
});

export default GalleryScreen;