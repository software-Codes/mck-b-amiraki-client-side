import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

const Layout = () => {
    return (
        <Tabs
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: 'white',
                    borderTopWidth: 1,
                    borderTopColor: '#EBEBEB',
                    paddingBottom: 10,
                    paddingTop: 10,
                    height: 65,
                },
                tabBarLabelStyle: {
                    fontFamily: 'jakartaMedium',
                    fontSize: 12,
                    marginTop: 5,
                },
                tabBarActiveTintColor: '#0286FF', // primary.500
                tabBarInactiveTintColor: '#666666', // secondary.700
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    switch (route.name) {
                        case 'home':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'profile':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        case 'annoucements': // Note: keeping your original spelling
                            iconName = focused ? 'notifications' : 'notifications-outline';
                            break;
                        case 'payments':
                            iconName = focused ? 'card' : 'card-outline';
                            break;
                        case 'gallery':
                            iconName = focused ? 'images' : 'images-outline';
                            break;
                        case 'events':
                            iconName = focused ? 'calendar' : 'calendar-outline';
                            break;
                        default:
                            iconName = 'square';
                    }

                    return <Ionicons name={iconName as any} size={size} color={color} />;
                },
            })}
        >
            <Tabs.Screen name="home" options={{ title: 'Home' }} />
            <Tabs.Screen name="annoucements" options={{ title: 'Annoucements' }} />
            <Tabs.Screen name="payments" options={{ title: 'Payments' }} />
            <Tabs.Screen name="gallery" options={{ title: 'Gallery' }} />
            <Tabs.Screen name="events" options={{ title: 'Events' }} />
            <Tabs.Screen name="profile" options={{ title: 'Profile' }} />

        </Tabs>
    );
};

export default Layout;