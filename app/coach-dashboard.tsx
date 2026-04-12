import { useRouter } from 'expo-router';
import {
    AlertTriangle,
    ChevronRight,
    LayoutGrid,
    Search,
    Users
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function CoachDashboard() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [coachName, setCoachName] = useState("");
  const [viewMode, setViewMode] = useState<'active' | 'archived' | 'deleted'>('active');
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Koç bilgilerini çek
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      if (profile) setCoachName(profile.full_name);

      // Öğrencileri çek (Filtreleme dahil)
      const { data: sData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .eq('coach_id', user.id)
        .order('full_name', { ascending: true });

      setStudents(sData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredStudents = students.filter(s => 
    (s.status || 'active') === viewMode &&
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-50 p-4">
      {/* Header Bölümü */}
      <View className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 mb-6 mt-8">
        <View className="flex-row items-center gap-4">
          <View className="p-3 bg-slate-900 rounded-2xl rotate-3">
            <LayoutGrid size={24} color="white" />
          </View>
          <View>
            <Text className="text-xl font-black italic uppercase tracking-tighter">{coachName || "Koç Paneli"}</Text>
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Kontrol Merkezi</Text>
          </View>
        </View>

        {/* Arama Barı */}
        <View className="relative mt-6">
          <TextInput 
            placeholder="Öğrenci ara..." 
            className="bg-slate-50 h-14 rounded-2xl px-12 font-bold text-sm"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View className="absolute left-4 top-4">
            <Search size={18} color="#cbd5e1" />
          </View>
        </View>
      </View>

      {/* İstatistik Kartları (Yatay Scroll) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3 mb-6">
        <View className="bg-white p-5 rounded-[2rem] min-w-[120px] items-center mr-3 border-b-4 border-blue-500">
          <Users size={20} color="#2563eb" />
          <Text className="text-2xl font-black mt-2">{students.filter(s => s.status === 'active').length}</Text>
          <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Öğrenciler</Text>
        </View>
        <View className="bg-white p-5 rounded-[2rem] min-w-[120px] items-center mr-3 border-b-4 border-orange-400">
          <AlertTriangle size={20} color="#fb923c" />
          <Text className="text-2xl font-black mt-2">0</Text>
          <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Kritik</Text>
        </View>
      </ScrollView>

      {/* Filtre Butonları */}
      <View className="flex-row bg-slate-200/50 p-1.5 rounded-2xl gap-1 mb-6">
        {(['active', 'archived', 'deleted'] as const).map((mode) => (
          <TouchableOpacity 
            key={mode}
            onPress={() => setViewMode(mode)}
            className={`flex-1 py-3 rounded-xl items-center ${viewMode === mode ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`text-[10px] font-black uppercase tracking-widest ${viewMode === mode ? 'text-blue-600' : 'text-slate-400'}`}>
              {mode === 'active' ? 'Aktif' : mode === 'archived' ? 'Arşiv' : 'Silinen'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Öğrenci Listesi */}
      <View className="space-y-4 pb-20">
        {filteredStudents.length > 0 ? filteredStudents.map((s) => (
          <TouchableOpacity 
          key={s.id} 
  onPress={() => {
    // Buradaki 'id' student'ın user_id'si olmalı
    router.push({
      pathname: "/student-detail",
      params: { id: s.user_id, name: s.full_name }
    });
  }}
  className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex-row items-center justify-between mb-4"
>
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 bg-slate-900 rounded-xl items-center justify-center">
                <Text className="text-white font-black">{s.full_name.charAt(0)}</Text>
              </View>
              <View>
                <Text className="font-black italic uppercase text-slate-800">{s.full_name}</Text>
                <Text className="text-[10px] font-bold text-slate-400 uppercase">{s.class_level}. Sınıf • {s.branch}</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>
        )) : (
          <Text className="text-center text-slate-400 font-bold uppercase italic mt-10">Öğrenci bulunamadı.</Text>
        )}
      </View>
    </ScrollView>
  );
}
