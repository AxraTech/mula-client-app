import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../../screens/Home/homeScreen';

const HomeStack = createNativeStackNavigator();

const HomeStackNavigation = () => {
    return (
        <HomeStack.Navigator
            initialRouteName='home'
            screenOptions={{
                headerShown: false,
                headerTransparent: true,
                headerBackTitleVisible: false,
                headerTitle: '',
            }}>
{/*---------------------------Home Gallery Screen--------------------------------- */}
            <HomeStack.Screen
                name='home'
                component={HomeScreen}
            />
        </HomeStack.Navigator>
    );
};

export default HomeStackNavigation;