import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeStack from "./Stack/HomeStack";

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

                    const getIcon = () => {
                        switch (route.name) {
                            case 'Home': return icons.home;
                            case 'Videos': return "#";
                            case 'Shop': return "#";
                            case 'Articles': return "#";
                            case 'Events': return "#";
                            default: return icons.home;
                        }
                    };

                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={onPress}
                            style={styles.tabItem}
                        >
                            <View style={[styles.iconWrapper, isFocused && styles.activeTab]}>
                                <Image
                                    source={getIcon()}
                                    style={[styles.icon, { tintColor: isFocused ? '#4a69bd' : '#636e72' }]}
                                />
                            </View>
                            <Text style={[ styles.label, { color: isFocused ? '#2d3436' : '#636e72' }]}>
                                {route.name}
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
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.floatingTab,
                tabBarActiveTintColor: '#A68D60',
                tabBarInactiveTintColor: '#222',
            }}
            >
            <Tab.Screen 
                name="HomeTab" 
                component={HomeStack}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>
                }} />
            {/* <Tab.Screen name="Videos" component={videos} />
            <Tab.Screen name="Shop" component={shop} />
            <Tab.Screen name="Articles" component={articles} />
            <Tab.Screen name="Events" component={events} />  */}
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  floatingBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: '92%',
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconWrapper: {
    padding: 8,
    borderRadius: 20,
    marginBottom: 2,
  },
  activeTab: {
    backgroundColor: '#f1f2f6',
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  floatingTab: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 40,
    height: 70,
    elevation: 5,
    shadowOpacity: 0.1,
    borderTopWidth: 0,
    paddingBottom: 5
  },
});

export default BottomTabNavigator;