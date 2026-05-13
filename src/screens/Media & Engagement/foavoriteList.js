import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useEcommerceStore from '../../store/useEcommerceStore';
import useAuthStore from '../../store/useAuthStore';

const FavoriteListScreen = ({ navigation }) => {
    // 1. Pull the unified toggleFavorite function we updated in the store
    const { favorites, loading, fetchFavorites, toggleFavorite } = useEcommerceStore();
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (user?.id) {
            fetchFavorites(user.id);
        }
    }, [user?.id]);

    const formatCurrency = (num) => {
        return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0";
    };

    const renderFavoriteItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.card} 
            // 2. Map item.product_id correctly for navigation
            onPress={() => navigation.navigate('galleryDetail', { artwork: item })}
        >
            <Image 
                source={{ uri: item.product_image_url || item.image }} 
                style={styles.image} 
            />
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                {/* 3. Handle different naming conventions from backend (artistName vs brand_name) */}
                <Text style={styles.artist}>by {item.artistName || item.brand_name || 'MULA Artist'}</Text>
                <Text style={styles.price}>{formatCurrency(item.price)} MMK</Text>
            </View>
            
            <TouchableOpacity 
                style={styles.heartBtn} 
                // 4. Use the toggleFavorite logic which now handles POST/DELETE internally
                onPress={() => toggleFavorite(user.id, item.product_id || item.id)}
            >
                <Text style={styles.heartIcon}>❤️</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtn}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Wishlist</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading && favorites.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#A37E2C" />
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    // Use item.id (the favorite record ID) for the key
                    keyExtractor={(item) => (item.id || item.product_id).toString()}
                    renderItem={renderFavoriteItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Your wishlist is empty.</Text>
                            <TouchableOpacity 
                                style={styles.exploreBtn}
                                onPress={() => navigation.navigate('Shop')}
                            >
                                <Text style={styles.exploreText}>Explore Artworks</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F5EB' },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingTop: Platform.OS === 'ios' ? 60 : 40, 
        paddingBottom: 20, 
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E8E2D0'
    },
    backBtn: { fontSize: 35, color: '#333' },
    headerTitle: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        letterSpacing: 1,
        fontFamily: Platform.OS === 'ios' ? 'Optima' : 'serif' 
    },
    listContent: { padding: 20, paddingBottom: 100 },
    card: { 
        flexDirection: 'row', 
        backgroundColor: '#FFF', 
        borderRadius: 15, 
        padding: 12, 
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8E2D0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5
    },
    image: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#EEE' },
    info: { flex: 1, marginLeft: 15 },
    title: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
    artist: { fontSize: 13, color: '#666', marginTop: 2 },
    price: { fontSize: 14, fontWeight: 'bold', color: '#A37E2C', marginTop: 4 },
    heartBtn: { padding: 10 },
    heartIcon: { fontSize: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { marginTop: 100, alignItems: 'center' },
    emptyText: { color: '#888', fontSize: 16, marginBottom: 20 },
    exploreBtn: {
        backgroundColor: '#A37E2C',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 25
    },
    exploreText: { color: '#FFF', fontWeight: 'bold' }
});

export default FavoriteListScreen;