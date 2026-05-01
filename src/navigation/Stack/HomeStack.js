import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../../screens/Home/homeScreen';
import GalleryDetail from '../../screens/Gallery/galleryDetail';

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

{/*---------------------------Gallery Detail Screen--------------------------------- */}
            <HomeStack.Screen
                name='galleryDetail'
                component={GalleryDetail}
            />
        </HomeStack.Navigator>
    );
};

export default HomeStackNavigation;