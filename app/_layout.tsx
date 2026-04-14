import "../global.css";


import { Drawer } from 'expo-router/drawer';
import { LayoutDashboard, ShieldCheck, UserPlus } from 'lucide-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "../global.css";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: '#f8fafc' },
          headerTitleStyle: { fontWeight: '900', textTransform: 'uppercase', fontSize: 14, letterSpacing: 1 },
          drawerActiveTintColor: '#2563eb',
          drawerLabelStyle: { fontWeight: '700', marginLeft: -10 },
          drawerStyle: { backgroundColor: 'white', width: 280 },
        }}
      >
        <Drawer.Screen
          name="coach-dashboard"
          options={{
            drawerLabel: 'Kontrol Paneli',
            title: 'KOÇLUK SİSTEMİ',
            drawerIcon: ({ color }) => <LayoutDashboard size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="add-student"
          options={{
            drawerLabel: 'Öğrenci Ekle',
            title: 'YENİ ÖĞRENCİ',
            drawerIcon: ({ color }) => <UserPlus size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="add-coach"
          options={{
            drawerLabel: 'Alt Koç Tanımla',
            title: 'YENİ KOÇ',
            drawerIcon: ({ color }) => <ShieldCheck size={22} color={color} />,
          }}
        />
        
        {/* Görünmesini istemediğimiz sayfaları gizleyelim */}
        <Drawer.Screen name="index" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="login" options={{ drawerItemStyle: { display: 'none' }, headerShown: false }} />
        <Drawer.Screen name="student-detail" options={{ drawerItemStyle: { display: 'none' }, title: 'ÖĞRENCİ ANALİZ' }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}
