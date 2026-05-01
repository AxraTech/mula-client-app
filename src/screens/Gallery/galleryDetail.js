import React from 'react';
import { 
    View, Text, Image, StyleSheet, ScrollView, 
    TouchableOpacity, Dimensions, ActivityIndicator 
} from 'react-native';
// 1. Import your Ecommerce Store
import useEcommerceStore from '../../store/useEcommerceStore'; 

const { width } = Dimensions.get('window');

const GalleryDetail = ({ route, navigation }) => {
    const { artwork } = route.params; 
    
    // 2. Access the addToCart function and loading state from Zustand
    const { addToCart, loading } = useEcommerceStore();

    // 3. Handle Add to Cart Press
    const handleAddToCart = async () => {
        try {
            await addToCart(artwork.id);
            
            // 4. Navigate to MyCart after successful addition
            navigation.navigate('myCart');
        } catch (error) {
            console.error("Failed to add to cart:", error);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image Section */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: artwork.product_image_url }} style={styles.mainImage} />
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backIcon}>‹</Text>
                    </TouchableOpacity>

                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Manual Artwork</Text>
                    </View>
                </View>

                {/* Content Section */}
                <View style={styles.contentWrapper}>
                    <View style={styles.headerRow}>
                        <View>
                            <Text style={styles.title}>{artwork.title}</Text>
                            <Text style={styles.artistLabel}>by {artwork.artist_name}</Text>
                        </View>
                        <TouchableOpacity>
                            <Text style={styles.heartIcon}>♡</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.sectionTitle}>Details</Text>

                    <View style={styles.detailsGrid}>
                        <View style={styles.detailBox}>
                            <Text style={styles.detailValue}>{artwork.artwork_year}</Text>
                            <Text style={styles.detailLabel}>Year</Text>
                        </View>
                        <View style={[styles.detailBox, styles.borderLeftRight]}>
                            <Text style={styles.detailValue}>{artwork.medium_type || "Oil on Canvas"}</Text>
                            <Text style={styles.detailLabel}>Medium</Text>
                        </View>
                        <View style={styles.detailBox}>
                            <Text style={styles.detailValue}>{artwork.dimensions}</Text>
                            <Text style={styles.detailLabel}>Dimensions</Text>
                        </View>
                    </View>

                    <Text style={styles.descriptionText}>
                        {artwork.description_mm ? artwork.description_mm.replace(/<[^>]*>/g, '') : "No description."}
                    </Text>

                    <Text style={styles.priceText}>
                        {Number(artwork.price).toLocaleString()} MMK
                    </Text>
                </View>
            </ScrollView>

            {/* Sticky Bottom Button linked to Store */}
            <View style={styles.bottomNav}>
                <TouchableOpacity 
                    style={[styles.addToCartBtn, loading && { opacity: 0.7 }]} 
                    onPress={handleAddToCart}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.btnText}>Add to Cart</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    imageContainer: { width: width, height: 450, position: 'relative' },
    mainImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    backButton: { 
        position: 'absolute', 
        top: 50, 
        left: 20, 
        backgroundColor: '#FFF', 
        width: 45, 
        height: 45, 
        borderRadius: 25, 
        justifyContent: 'center', 
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4
    },
    backIcon: { fontSize: 35, color: '#000', fontWeight: '300', marginTop: -5 },
    fullScreenBtn: { 
        position: 'absolute', 
        bottom: 20, 
        right: 20, 
        backgroundColor: 'rgba(0,0,0,0.4)', 
        paddingHorizontal: 10, 
        paddingVertical: 5, 
        borderRadius: 6 
    },
    fullScreenText: { color: '#FFF', fontSize: 11 },
    badge: { 
        position: 'absolute', 
        bottom: 20, 
        left: 20, 
        backgroundColor: '#A68D60', 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 8 
    },
    badgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
    contentWrapper: { padding: 20 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    title: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A' },
    artistLabel: { fontSize: 16, color: '#666', marginTop: 4 },
    heartIcon: { fontSize: 30, color: '#A68D60' },
    exploreRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        paddingVertical: 18, 
        borderTopWidth: 1, 
        borderBottomWidth: 1, 
        borderColor: '#F0F0F0', 
        marginTop: 25 
    },
    exploreText: { fontSize: 15, color: '#1A1A1A', fontWeight: '500' },
    arrow: { fontSize: 22, color: '#CCC', marginTop: -2 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 25, marginBottom: 15, color: '#1A1A1A' },
    detailsGrid: { 
        flexDirection: 'row', 
        borderWidth: 1, 
        borderColor: '#F0F0F0', 
        borderRadius: 12, 
        backgroundColor: '#FAFAFA' 
    },
    detailBox: { flex: 1, paddingVertical: 15, alignItems: 'center' },
    borderLeftRight: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#F0F0F0' },
    detailValue: { fontWeight: 'bold', fontSize: 14, color: '#1A1A1A' },
    detailLabel: { fontSize: 12, color: '#999', marginTop: 4 },
    descriptionText: { fontSize: 15, color: '#555', lineHeight: 24, marginTop: 25 },
    priceText: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        color: '#A68D60', 
        marginTop: 30, 
        marginBottom: 120 
    },
    bottomNav: { 
        position: 'absolute', 
        bottom: 0, 
        width: '100%', 
        backgroundColor: '#FFF', 
        padding: 20,
        borderTopWidth: 1,
        borderColor: '#F0F0F0'
    },
    addToCartBtn: { 
        backgroundColor: '#A68D60', 
        paddingVertical: 16, 
        borderRadius: 12, 
        alignItems: 'center' 
    },
    btnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});

export default GalleryDetail;