import { useRouter } from 'expo-router';
import { GraduationCap, ShieldCheck } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingType, setLoadingType] = useState<'student' | 'coach' | null>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  

    const handleLogin = async (selectedType: 'student' | 'coach') => {
    if (!email || !password) {
      return Alert.alert("Uyarı", "Lütfen tüm alanları doldurun.");
    }

    setLoadingType(selectedType);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) throw authError;

      // Profil bilgilerini çekiyoruz
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', authData.user?.id)
        .single();

      if (profileError || !profile) {
        throw new Error("Profil bilgileriniz bulunamadı.");
      }

      const userRole = profile.role;
      // admin, coach veya admin.coach gibi rolleri koç olarak kabul et
      const isCoachOrAdmin = userRole.includes('coach') || userRole.includes('admin');

      // YETKİ KONTROLLERİ
      if (selectedType === 'coach' && !isCoachOrAdmin) {
        await supabase.auth.signOut();
        throw new Error("Bu hesap koç veya admin yetkisine sahip değil.");
      }

      if (selectedType === 'student' && userRole !== 'student') {
        await supabase.auth.signOut();
        throw new Error("Bu hesap bir öğrenci hesabı değildir.");
      }

      // YÖNLENDİRME
      if (isCoachOrAdmin) {
        router.replace('/coach-dashboard');
      } else {
        router.replace('/student-dashboard');
      }

    } catch (error: any) {
      Alert.alert("Giriş Hatası", error.message);
    } finally {
      setLoadingType(null);
    }
  };


  return (
    <ScrollView className="flex-1 bg-[#f8fafc]">
      <View className="min-h-screen items-center justify-center p-6">
        
        {/* Logo Alanı */}
        <View className="mb-10 items-center">
          <Text className="text-3xl font-black text-slate-900 tracking-tight">Tekrar Hoş Geldin!</Text>
          <Text className="text-slate-400 font-medium mt-2 text-center">Eğitim yolculuğuna devam etmek için giriş yap.</Text>
        </View>

        {/* Form Alanı */}
        <View className="w-full max-w-md bg-white p-8 rounded-[2.5rem] shadow-xl">
          <View className="space-y-4">
            <Text className="font-bold text-xs uppercase tracking-widest text-slate-400 ml-1">E-posta Adresi</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="ornek@mail.com"
              className="h-14 rounded-2xl border border-slate-100 bg-slate-50 px-4 focus:border-blue-500 font-medium"
              autoCapitalize="none"
            />

            <Text className="font-bold text-xs uppercase tracking-widest text-slate-400 ml-1 mt-4">Şifre</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              className="h-14 rounded-2xl border border-slate-100 bg-slate-50 px-4 focus:border-blue-500 font-medium"
            />

            <View className="flex flex-col gap-4 mt-6">
              {/* Öğrenci Girişi Butonu */}
              <TouchableOpacity
                onPress={() => handleLogin('student')}
                disabled={isLoading}
                className="h-16 flex-row items-center justify-center bg-blue-600 rounded-2xl shadow-lg shadow-blue-200"
              >
                {isLoading ? <ActivityIndicator color="white" /> : <GraduationCap size={24} color="white" />}
                <Text className="text-white text-lg font-black ml-3">Öğrenci Girişi</Text>
              </TouchableOpacity>

              <View className="flex-row items-center my-2">
                <View className="flex-1 h-[1px] bg-slate-100" />
                <Text className="mx-4 text-slate-300 font-bold text-xs">VEYA</Text>
                <View className="flex-1 h-[1px] bg-slate-100" />
              </View>

              {/* Koç Girişi Butonu */}
              <TouchableOpacity
                onPress={() => handleLogin('coach')}
                disabled={isLoading}
                className="h-16 flex-row items-center justify-center bg-white border-2 border-slate-100 rounded-2xl"
              >
                <ShieldCheck size={24} color="#2563eb" />
                <Text className="text-slate-600 text-lg font-black ml-3">Koç Girişi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text className="mt-8 text-slate-300 text-sm font-bold">© 2026 Göksel Atak Eğitim Kurumları</Text>
      </View>
    </ScrollView>
  );
}
