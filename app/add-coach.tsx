import { useRouter } from 'expo-router';
import { ChevronLeft, ShieldCheck, UserCheck } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function AddCoach() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const router = useRouter();

  const handleCreateCoach = async () => {
    if (!form.email || !form.password || !form.fullName) {
      return Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
    }
    
    setLoading(true);
    try {
      // 1. Supabase Auth üzerinde yeni kullanıcı oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (authError) throw authError;

      // 2. Profiles tablosuna 'coach' rolüyle kaydet
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          user_id: authData.user?.id,
          full_name: form.fullName,
          role: 'coach', // Sabit rol: koç
        }
      ]);

      if (profileError) throw profileError;

      Alert.alert("Başarılı", `${form.fullName} isimli koç sisteme eklendi.`);
      router.back();
    } catch (e: any) {
      Alert.alert("Hata", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 p-6">
      {/* Üst Başlık */}
      <View className="flex-row items-center mt-8 mb-8">
        <TouchableOpacity onPress={() => router.back()} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <View className="ml-4">
          <Text className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Yeni Koç Ekle</Text>
          <Text className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Yönetici Paneli Yetkisi</Text>
        </View>
      </View>

      <View className="bg-slate-900 p-8 rounded-[3rem] shadow-xl space-y-6">
        <View className="items-center mb-4">
          <View className="p-4 bg-blue-600 rounded-3xl rotate-3">
            <ShieldCheck size={32} color="white" />
          </View>
        </View>

        <View>
          <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Koç Ad Soyad</Text>
          <TextInput 
            className="bg-white/10 p-4 rounded-2xl text-white font-bold border border-white/10"
            placeholder="İsim giriniz..."
            placeholderTextColor="#64748b"
            onChangeText={(t) => setForm({...form, fullName: t})}
          />
        </View>

        <View>
          <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Kurumsal E-posta</Text>
          <TextInput 
            className="bg-white/10 p-4 rounded-2xl text-white font-bold border border-white/10"
            placeholder="koc@kurum.com"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            onChangeText={(t) => setForm({...form, email: t})}
          />
        </View>

        <View>
          <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Sistem Şifresi</Text>
          <TextInput 
            className="bg-white/10 p-4 rounded-2xl text-white font-bold border border-white/10"
            placeholder="••••••"
            placeholderTextColor="#64748b"
            secureTextEntry
            onChangeText={(t) => setForm({...form, password: t})}
          />
        </View>

        <TouchableOpacity 
          onPress={handleCreateCoach}
          disabled={loading}
          className="bg-blue-600 p-5 rounded-[2rem] items-center mt-6 shadow-lg shadow-blue-500/50"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <View className="flex-row items-center">
              <UserCheck size={20} color="white" />
              <Text className="text-white font-black uppercase italic tracking-widest ml-2">Koçu Sisteme Tanımla</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Text className="text-center text-slate-400 text-[10px] font-bold uppercase mt-8 italic">
        * Koç eklendikten sonra kendi paneliyle giriş yapabilir.
      </Text>
    </ScrollView>
  );
}
