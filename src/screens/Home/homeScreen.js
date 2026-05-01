import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from "react-native";
import { getHomeData } from "../../services/homeAPI";
import useAuthStore from "../../store/useAuthStore";

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    const token = useAuthStore((state) => state.token);
    const [ rawData, setRawData ] = useState(null);
    const [ filteredData, setFilteredData ] = useState([]);
    const [ activeTab, setActiveTab ] = useState('All');
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        if (token) {
            loadData();
        }
    }, [token]);

    const loadData = async () => {
        try {
            const result = await getHomeData(token);
            console.log("Artworks found:", result.all.length);
            setRawData(result);
            setFilteredData(result.all);
            
            if (!token) {
                console.log("No token found");
                setLoading(false);
                return;
            }
        }
        catch (error) {
            console.log("Error fetching home data:", error);
        }
        finally {
            setLoading(false);
        }
    };

    const handleFilter = (tab) => {
        setActiveTab(tab);
        if (tab === 'All') setFilteredData(rawData.all);
        else if (tab === 'Traditional') setFilteredData(rawData.traditionalArt);
        else if (tab === 'Digital') setFilteredData(rawData.digitalArt);
    };

    const ArtCard = ({ item, navigation }) => (
        <TouchableOpacity 
            style={styles.cardContainer} 
            activeOpacity={0.9}
            onPress={() => navigation.navigate('galleryDetail', { artwork: item })} // Ensure 'ArtworkDetail' matches your Stack Navigator name
        >
            <View style={styles.hangingThread} />
            <View style={styles.dot} />
            
            <View style={styles.imageWrapper}>
                <Image source={{ uri: item.image }} style={styles.artImage} />
                {item.isSold && (
                    <View style={styles.soldBadge}>
                        <Text style={styles.soldText}>SOLD</Text>
                    </View>
                )}
                {!item.isSold && 
                    <TouchableOpacity style={styles.heartBtn}><Text>❤️</Text></TouchableOpacity>
                }
            </View>
            <View style={styles.infoArea}>
                <Text style={styles.titleText}>{item.title}</Text>
                <Text style={styles.artistText}>{item.artistName}</Text>
                {!item.isSold ? (
                    <Text style={styles.priceText}>{item.price} MMK</Text>
                ) : (
                    <Text style={styles.soldOutText}>Sold Out</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.logo}>M U L A</Text>
                <Text style={styles.tagline}>Timeless Art For An Ever-Changing World</Text>

                <View style={styles.filterRow}>
                    {['All', 'Traditional', 'Digital'].map(tab => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => handleFilter(tab)}
                            style={[styles.filterBtn, activeTab === tab && styles.activeFilterBtn]}
                        >
                            <Text style={[styles.filterText, activeTab === tab && styles.activeFilterTab]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.timelineLine} />
                <View style={styles.masonryGrid}>
                    <View style={styles.column}>
                        {filteredData.filter((_, i) => i % 2 === 0).map(item => (
                            <ArtCard key={item.id} item={item} navigation={navigation} />
                        ))}
                    </View>
                    <View style={styles.column}>
                        {filteredData.filter((_, i) => i % 2 !== 0).map(item => (
                            <ArtCard key={item.id} item={item} navigation={navigation} />
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F2E9' },
    header: { alignItems: 'center', paddingTop: 50, paddingBottom: 20 },
    logo: { fontSize: 24, fontWeight: 'bold', letterSpacing: 8 },
    tagline: { fontSize: 12, fontStyle: 'italic', color: '#888', marginVertical: 10 },
    filterRow: { flexDirection: 'row', gap: 10 },
    filterBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#A68D60' },
    activeFilterBtn: { backgroundColor: '#A68D60' },
    filterText: { color: '#A68D60', fontWeight: '500' },
    activeFilterTab: { color: '#FFF' },
    scrollContent: { paddingBottom: 100 },
    timelineLine: { 
        position: 'absolute', 
        left: '50%', 
        top: 0, 
        bottom: 0, 
        width: 1, 
        backgroundColor: '#D1C7AC', 
        zIndex: 0 
    },
    masonryGrid: { flexDirection: 'row', paddingHorizontal: 10 },
    column: { flex: 1 },
    
    cardContainer: { 
        width: '90%', 
        alignSelf: 'center', 
        backgroundColor: '#FFF', 
        borderRadius: 4, 
        elevation: 3,
        marginTop: 60,
        position: 'relative'
    },
    hangingThread: {
        position: 'absolute',
        top: -20,
        left: '50%',
        width: 1,
        height: 20,
        backgroundColor: '#D1C7AC',
    },
    dot: { 
        position: 'absolute', 
        width: 8, 
        height: 8, 
        borderRadius: 4, 
        backgroundColor: '#A68D60', 
        top: -24,
        left: '50%',
        marginLeft: -4,
        zIndex: 2
    },

    imageWrapper: { position: 'relative' },
    artImage: { width: '100%', height: 220, borderRadius: 4 },
    soldBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#D97D54', padding: 4, borderRadius: 4 },
    soldText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
    heartBtn: { position: 'absolute', top: 10, left: 10, backgroundColor: '#FFF', borderRadius: 15, padding: 5 },
    infoArea: { padding: 10 },
    titleText: { fontWeight: 'bold', fontSize: 14 },
    artistText: { color: '#777', fontSize: 12 },
    priceText: { color: '#A68D60', fontWeight: 'bold', marginTop: 5 },
    soldOutText: { color: '#A68D60', marginTop: 5 },
});

export default HomeScreen;