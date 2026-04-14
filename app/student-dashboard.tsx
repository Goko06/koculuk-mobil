import { useRouter } from 'expo-router';
import {
  BookOpen, CheckCircle2,
  ChevronRight,
  Clock,
  LogOut,
  Plus, TrendingUp
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const router = useRouter();

  const fetchStudentData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Profil bilgilerini çek
      const { data: pData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setProfile(pData);

      // Öğrencinin ödevlerini çek
      const { data: tData } = await supabase
        .from('student_tasks')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });
      setTasks(tData || []);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudentData(); }, [fetchStudentData]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loading) return (
    <View className="flex-1 justify-center items-center bg-slate-50">
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-slate-50">
      {/* Üst Bilgi Paneli */}
      <View className="bg-slate-900 p-8 pt-16 rounded-b-[3.5rem] shadow-2xl">
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-blue-400 font-black text-xs uppercase tracking-[2px]">Öğrenci Paneli</Text>
            <Text className="text-white text-3xl font-black italic uppercase tracking-tighter mt-1">Selam, {profile?.full_name?.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} className="p-3 bg-white/10 rounded-2xl">
            <LogOut size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Özet Kartları */}
        <View className="flex-row gap-4 mt-8">
          <View className="bg-blue-600 flex-1 p-5 rounded-[2.5rem]">
            <TrendingUp size={24} color="white" />
            <Text className="text-white text-2xl font-black mt-2">%{tasks.length > 0 ? ((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100).toFixed(0) : 0}</Text>
            <Text className="text-blue-100 text-[9px] font-bold uppercase tracking-widest">Başarı Oranı</Text>
          </View>
          <View className="bg-white/10 flex-1 p-5 rounded-[2.5rem]">
            <BookOpen size={24} color="#60a5fa" />
            <Text className="text-white text-2xl font-black mt-2">{tasks.filter(t => t.status === 'pending').length}</Text>
            <Text className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Bekleyen Ödev</Text>
          </View>
        </View>
      </View>

      <View className="p-6">
        {/* Hızlı Aksiyon Butonu */}
        <TouchableOpacity 
          className="bg-white p-6 rounded-[2.5rem] flex-row items-center justify-between border border-slate-100 mb-8 shadow-sm"
          onPress={() => Alert.alert("Bilgi", "Günlük giriş ekranı yakında burada olacak.")}
        >
          <View className="flex-row items-center">
            <View className="p-4 bg-emerald-100 rounded-3xl">
              <Plus size={24} color="#059669" />
            </View>
            <View className="ml-4">
              <Text className="font-black italic uppercase text-slate-800">Çalışma Ekle</Text>
              <Text className="text-[10px] text-slate-400 font-bold uppercase">Bugün neler yaptın?</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#cbd5e1" />
        </TouchableOpacity>

        {/* Aktif Ödevler Listesi */}
        <Text className="font-black italic uppercase text-slate-400 mb-4 ml-2 tracking-widest text-[10px]">Atanan Görevler</Text>
        {tasks.map((task) => (
          <View key={task.id} className="bg-white p-5 rounded-[2.5rem] flex-row items-center border border-slate-100 mb-4 shadow-sm">
            <View className={`p-4 rounded-3xl ${task.status === 'completed' ? 'bg-green-100' : 'bg-amber-100'}`}>
              {task.status === 'completed' ? <CheckCircle2 size={24} color="#16a34a" /> : <Clock size={24} color="#d97706" />}
            </View>
            <View className="ml-4 flex-1">
              <Text className="font-black italic uppercase text-slate-800 tracking-tighter">{task.topic_name}</Text>
              <Text className="text-[10px] font-bold text-slate-400 uppercase">{task.target_questions} Soru Hedefi</Text>
            </View>
            <TouchableOpacity className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <ChevronRight size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
