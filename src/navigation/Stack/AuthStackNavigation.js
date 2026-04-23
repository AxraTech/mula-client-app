import login from '../../screens/Auth/login';
import signup from '../../screens/Auth/signup';
import otpVerify from '../../screens/Auth/OTPVerify';
import forgetPassword from '../../screens/Auth/forgetPassword';
import resetPassword from '../../screens/Auth/resetPassword';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

const AuthStack = createNativeStackNavigator();

const AuthStackNavigation = () => {
    return (
        <AuthStack.Navigator
            initialRouteName='login'
            screenOptions={{
                headerShown: false,
                headerTransparent: true,
                headerBackTitleVisible: false,
                headerTitle: '',
            }}>
{/*---------------------------Login Screen------------------------------------- */}
                <AuthStack.Screen
                    name='login'
                    component={login}
                    options={{ headerShown: true }}
                />
{/*---------------------------Signup Screen------------------------------------- */}
                <AuthStack.Screen
                    name='signup'
                    component={signup}
                />
{/*---------------------------OTP Verify Screen------------------------------------- */}
                <AuthStack.Screen
                    name='otpVerify'
                    component={otpVerify}
                />
{/*---------------------------Forget Password Screen------------------------------------- */}
                <AuthStack.Screen
                    name='forgetPassword'
                    component={forgetPassword}
                />
{/*---------------------------Reset Password Screen------------------------------------- */}
                <AuthStack.Screen
                    name='resetPassword'
                    component={resetPassword}
                />
        </AuthStack.Navigator>
    );
};

export default AuthStackNavigation;