import { Tabs } from 'expo-router';
import { Calculator, Settings } from 'lucide-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function TabLayout() {
  return (
    <GestureHandlerRootView>
      <Tabs
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: '#0891b2',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Calculator',
            tabBarIcon: ({ size, color }) => (
              <Calculator size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ size, color }) => (
              <Settings size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
