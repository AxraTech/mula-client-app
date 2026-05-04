import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './BottomTabNavigator';
import GalleryDetail from '../screens/Gallery/galleryDetail';
import MyCart from '../screens/Ecommerce/myCart';
import Checkout from '../screens/Ecommerce/checkOut';
import OrderSuccess from '../screens/Ecommerce/orderSuccess';
import HomeScreen from '../screens/Home/homeScreen';

const Stack = createStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 1. The Tab Bar only exists inside this screen */}
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

      {/* 2. These screens will now cover the entire screen, hiding the tab bar */}
      <Stack.Screen name='home' component={HomeScreen} />
      <Stack.Screen name="galleryDetail" component={GalleryDetail} />
      <Stack.Screen name="myCart" component={MyCart} />
      <Stack.Screen name="checkOut" component={Checkout} />
      <Stack.Screen name='orderSuccess' component={OrderSuccess} />
    </Stack.Navigator>
  );
};

export default MainNavigator;