import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Platform} from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { Ionicons, AntDesign, MaterialIcons, FontAwesome5} from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabBarIconWrapper({ children, focused }: { children: React.ReactNode; focused: boolean }) {
  return(
    <View style={[styles.iconContainer, focused && styles.activePill]}>
      {children}
    </View>
  );
}
  
export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const ActiveColor = '#0A1E3F';
  const InactiveColor = '#44474E';
   const bottomGap = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ActiveColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor:'#F0F2F5', paddingTop:6, height:56 + bottomGap, paddingBottom:bottomGap},
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500',},
        
          
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ focused }) => (
        <TabBarIconWrapper focused={focused}>
        <AntDesign size={24} name="appstore" color={focused ? ActiveColor : InactiveColor} />
        </TabBarIconWrapper>
        )}}/>
      <Tabs.Screen name="explore" options={{ title: 'Explore', tabBarIcon: ({ focused }) => (
        <TabBarIconWrapper focused={focused}>
          <MaterialIcons size={24} name="explore" color={focused ? ActiveColor : InactiveColor} />
        </TabBarIconWrapper>
        )}}/>
      <Tabs.Screen name="trips" options={{title:"Trips", tabBarIcon:({focused}) => (
        <TabBarIconWrapper focused={focused}>
          <FontAwesome5 name="bus-alt" size={24} color={focused ? ActiveColor : InactiveColor} />
        </TabBarIconWrapper>
        )}}/>
      <Tabs.Screen name="notifications" options={{title: "Alerts", tabBarIcon: ({ focused }) => (
        <TabBarIconWrapper focused={focused}>
          <Ionicons name="notifications-outline" size={24} color={focused ? ActiveColor : InactiveColor} />
        </TabBarIconWrapper>
        )}}/>
      <Tabs.Screen name="profile" options={{title: "Profile", tabBarIcon: ({ focused }) => (
        <TabBarIconWrapper focused={focused}>
          <Ionicons name="person-outline" size={24} color={focused ? ActiveColor : InactiveColor} />
        </TabBarIconWrapper>
        )}}/>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 56,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  activePill: {
    backgroundColor: '#E0E8F5',
  },
});