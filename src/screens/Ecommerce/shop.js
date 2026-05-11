import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Platform,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getHomeData } from '../../services/homeAPI';
import useAuthStore from '../../store/useAuthStore';
import useEcommerceStore from '../../store/useEcommerceStore';

const CATEGORIES = ['All', 'Manual Art', 'Digital Art'];
const FILTERS = ['All', 'Watercolor', 'Oil Painting', 'Acrylic', 'Digital Illus'];

const ShopScreen = ({ navigation }) => {
    const token = useAuthStore((state) => state.token);
    const cartItems = useEcommerceStore((state) => state.cartItems);
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeFilter, setActiveFilter] = useState('All');
    const cartCount = Array.isArray(cartItems) ? cartItems.length : 0;
    
    // Data State
    const [rawData, setRawData] = useState(null);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);

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

    // Filter Logic Integration
    const handleCategoryFilter = (cat) => {
        setActiveCategory(cat);
        if (!rawData) return;
        
        if (cat === 'All') setFilteredData(rawData.all);
        else if (cat === 'Manual Art') setFilteredData(rawData.traditionalArt);
        else if (cat === 'Digital Art') setFilteredData(rawData.digitalArt);
    };

    const renderArtwork = ({ item }) => (
        <TouchableOpacity 
            style={styles.cardContainer}
            onPress={() => navigation.navigate('galleryDetail', { artwork: item })}
        >
            <View style={styles.timelineContainer}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineLine} />
            </View>

            <View style={styles.card}>
                <View style={styles.imageWrapper}>
                    <Image source={{ uri: item.image }} style={styles.artImage} />
                    <View style={[styles.typeBadge, { backgroundColor: item.type === 'Manual' ? '#A37E2C' : '#6200EE' }]}>
                        <Text style={styles.typeText}>{item.type || (item.category === 'Digital' ? 'Digital' : 'Manual')}</Text>
                    </View>
                    <TouchableOpacity style={styles.favoriteBtn}>
                        <Text style={styles.heartIcon}>♡</Text>
                    </TouchableOpacity>
                    {item.isSold && (
                        <View style={styles.soldOverlay}>
                            <Text style={styles.soldOverlayText}>SOLD OUT</Text>
                        </View>
                    )}
                </View>
                
                <View style={styles.cardInfo}>
                    <Text style={styles.artTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.artArtist}>by {item.artistName}</Text>
                    <Text style={[styles.artPrice, item.isSold && { color: '#C62828' }]}>
                        {item.isSold ? 'Sold Out' : `${item.price} MMK`}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#A37E2C" />;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Area */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.menuBtn}>
                    <Text style={styles.iconText}>≡</Text>
                </TouchableOpacity>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>M U L A</Text>
                    <Text style={styles.logoSubtext}>THE ART GALLERY</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('myCart')}>
                    <View style={styles.cartBtn}>
                        <Text style={styles.iconText}>👜</Text>
                        {cartCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{cartCount}</Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </View>

            <Text style={styles.tagline}>Timeless Art For An Ever-Changing World</Text>

            {/* Search and Filters */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput 
                        placeholder="Search artworks, artists..." 
                        style={styles.searchInput}
                        placeholderTextColor="#AAA"
                    />
                </View>
            </View>

            <View style={styles.categoryScroll}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity 
                            key={cat} 
                            style={[styles.catBtn, activeCategory === cat && styles.activeCatBtn]}
                            onPress={() => handleCategoryFilter(cat)}
                        >
                            <Text style={[styles.catBtnText, activeCategory === cat && styles.activeCatText]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Sub-Filters */}
            <View style={styles.filterRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20 }}>
                    {FILTERS.map(f => (
                        <TouchableOpacity 
                            key={f} 
                            style={[styles.filterBtn, activeFilter === f && styles.activeFilterBtn]}
                            onPress={() => setActiveFilter(f)}
                        >
                            <Text style={[styles.filterBtnText, activeFilter === f && styles.activeFilterText]}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <TouchableOpacity style={styles.mainFilterBtn}>
                    <Text style={styles.mainFilterText}>⩒ Filter</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredData}
                renderItem={renderArtwork}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
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
        paddingVertical: 10
    },
    logoContainer: { alignItems: 'center' },
    logoText: { fontSize: 24, fontWeight: 'bold', letterSpacing: 8, color: '#1A1A1A' },
    logoSubtext: { fontSize: 8, letterSpacing: 2, color: '#666', marginTop: -4 },
    iconText: { fontSize: 24, color: '#333' },
    cartBtn: { position: 'relative' },
    badge: { 
        position: 'absolute', 
        top: -4, 
        right: -4, 
        backgroundColor: '#A37E2C', 
        borderRadius: 10, 
        width: 16, 
        height: 16, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
    tagline: { 
        textAlign: 'center', 
        fontStyle: 'italic', 
        color: '#A37E2C', 
        fontSize: 13, 
        marginBottom: 15,
        fontFamily: Platform.OS === 'ios' ? 'Optima' : 'serif' 
    },
    searchContainer: { paddingHorizontal: 20, marginBottom: 15 },
    searchBar: { 
        flexDirection: 'row', 
        backgroundColor: '#FFF', 
        borderRadius: 12, 
        paddingHorizontal: 15, 
        height: 45, 
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8E2D0'
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14 },
    categoryScroll: { marginBottom: 15 },
    catBtn: { 
        paddingHorizontal: 20, 
        paddingVertical: 8, 
        borderRadius: 20, 
        backgroundColor: '#FFF', 
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#E8E2D0'
    },
    activeCatBtn: { backgroundColor: '#A37E2C', borderColor: '#A37E2C' },
    catBtnText: { color: '#A37E2C', fontWeight: '600' },
    activeCatText: { color: '#FFF' },
    filterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    filterBtn: { 
        paddingHorizontal: 15, 
        paddingVertical: 6, 
        borderRadius: 15, 
        borderWidth: 1, 
        borderColor: '#E8E2D0', 
        marginRight: 8,
        backgroundColor: '#FFF'
    },
    activeFilterBtn: { borderColor: '#A37E2C', backgroundColor: '#F9F5EB' },
    filterBtnText: { fontSize: 12, color: '#888' },
    activeFilterText: { color: '#A37E2C', fontWeight: 'bold' },
    mainFilterBtn: { paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center' },
    mainFilterText: { 
        fontSize: 12, 
        color: '#A37E2C', 
        fontWeight: 'bold', 
        borderWidth: 1, 
        borderColor: '#A37E2C', 
        padding: 5, 
        borderRadius: 5 
    },
    listContent: { paddingHorizontal: 10, paddingTop: 20 },
    cardContainer: { width: '50%', paddingHorizontal: 8, marginBottom: 25 },
    timelineContainer: { position: 'absolute', top: -15, left: '50%', alignItems: 'center', zIndex: -1 },
    timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#A37E2C' },
    timelineLine: { width: 1, height: 40, backgroundColor: '#E8E2D0' },
    card: { 
        backgroundColor: '#FFF', 
        borderRadius: 15, 
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E8E2D0',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    imageWrapper: { width: '100%', height: 180, position: 'relative' },
    artImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    typeBadge: { 
        position: 'absolute', 
        top: 8, 
        left: 8, 
        paddingHorizontal: 8, 
        paddingVertical: 3, 
        borderRadius: 5 
    },
    typeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
    favoriteBtn: { 
        position: 'absolute', 
        top: 8, 
        right: 8, 
        backgroundColor: 'rgba(255,255,255,0.8)', 
        borderRadius: 15, 
        width: 30, 
        height: 30, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    heartIcon: { fontSize: 18, color: '#A37E2C' },
    soldOverlay: { 
        ...StyleSheet.absoluteFillObject, 
        backgroundColor: 'rgba(198, 40, 40, 0.7)', 
        justifyContent: 'center', 
        alignItems: 'center',
        top: '80%'
    },
    soldOverlayText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
    cardInfo: { padding: 12 },
    artTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A' },
    artArtist: { fontSize: 11, color: '#888', marginTop: 2 },
    artPrice: { fontSize: 13, fontWeight: 'bold', color: '#A37E2C', marginTop: 5 },
});

export default ShopScreen;