import login from '../screens/Auth/login';

export default AuthRoutes = [
    {
        name: 'login',
        component: login,
        options: route => {
            return {
                headerShown: true,
            };
        },
    },
];