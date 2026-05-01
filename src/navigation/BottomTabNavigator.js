import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/Home/homeScreen";

const Tab = createBottomTabNavigator();

// Custom Tab Bar Component
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

                    const label = options.tabBarLabel || route.name;

                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={onPress}
                            style={styles.tabItem}
                        >
                            <View style={[styles.iconWrapper, isFocused && styles.activeTab]}>
                                {/* Using Emoji or Text as fallback for now since 'icons' wasn't defined */}
                                <Text style={{ fontSize: 20, color: isFocused ? '#A68D60' : '#636e72' }}>
                                    {route.name === 'Home' ? '🏠' : '👤'}
                                </Text>
                            </View>
                            <Text style={[styles.label, { color: isFocused ? '#A68D60' : '#636e72' }]}>
                                {label}
                            </Text>
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
            <Tab.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{ tabBarLabel: 'Home' }} 
            />
            {/* Add other tab screens like Profile or Search here */}
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBarContainer: {
        position: 'absolute',
        bottom: 25,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    floatingBar: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        width: '85%',
        height: 65,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'space-around',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    tabItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    iconWrapper: { padding: 6, borderRadius: 20 },
    activeTab: { backgroundColor: '#F5F2E9' },
    label: { fontSize: 10, fontWeight: '600', marginTop: 2 },
});

export default BottomTabNavigator;