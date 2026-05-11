import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/Home/homeScreen";
import ShopScreen from "../screens/Ecommerce/shop";
import ProfileScreen from "../screens/Profile/profileScreen";

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {
    return (
        <View style={styles.tabBarContainer}>
            <View style={styles.floatingBar}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    // Function to render the correct icon based on route name
                    const renderIcon = (name, focused) => {
                        const color = focused ? '#007AFF' : '#2d3436'; // Blue for active as per screenshot
                        switch (name) {
                            case 'Home': return <Text style={[styles.iconText, { color }]}>🏠</Text>;
                            case 'Shop': return <Text style={[styles.iconText, { color }]}>👜</Text>;
                            case 'Profile': return <Text style={[styles.iconText, { color }]}>👤</Text>;
                            default: return null;
                        }
                    };

                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={onPress}
                            activeOpacity={0.8}
                            style={styles.tabItem}
                        >
                            <View style={[styles.iconWrapper, isFocused && styles.activeTabHighlight]}>
                                {renderIcon(route.name, isFocused)}
                                <Text style={[styles.label, { color: isFocused ? '#007AFF' : '#2d3436' }]}>
                                    {options.tabBarLabel || route.name}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Shop" component={ShopScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBarContainer: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 35 : 20,
        left: 0,
        right: 0,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    floatingBar: {
        flexDirection: 'row',
        backgroundColor: '#F9F6F0',
        width: '92%',
        height: 70,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    tabItem: { 
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center',
    },
    iconWrapper: { 
        alignItems: 'center', 
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 25,
    },
    activeTabHighlight: { 
        backgroundColor: '#E8E8E8',
    },
    iconText: {
        fontSize: 22,
        marginBottom: 2,
    },
    label: { 
        fontSize: 11, 
        fontWeight: 'bold',
    },
});

export default BottomTabNavigator;