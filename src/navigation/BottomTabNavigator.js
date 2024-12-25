import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Home from '../Home';
import { colours } from '../../constants/colours';
import Goals from '../Goals';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator({ session }) {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;
                        let iconSize = focused ? size + 4 : size;

                        if (route.name === 'Home') {
                            iconName = focused ? 'home' : 'home-outline';
                        } else if (route.name === 'Goals') {
                            iconName = focused ? 'trophy' : 'trophy-outline';
                        }

                        return <Ionicons name={iconName} size={iconSize} color={color} />;
                    },
                    tabBarActiveTintColor: "tomato",
                    tabBarInactiveTintColor: colours.outline,
                    tabBarShowLabel: false,
                    tabBarIconStyle: {
                        marginTop: 5, // Adjust icon position to center
                    },
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: colours.bg,
                        borderTopColor: colours.outline,
                    }
                })}
            >
                <Tab.Screen name="Home" component={Home} />
                <Tab.Screen name="Goals" component={Goals} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
