import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    Alert.alert('Hata', 'Giriş yapılamadı: ' + error.message);
  } else {
    Alert.alert('Başarılı', 'Giriş yapıldı!');
    // Burada dashboard'a yönlendirme yapacağız
  }
};

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-slate-50"
    >
      <View className="flex-1 justify-center px-8">
        <View className="items-center mb-10">
          <Text className="text-3xl font-bold text-blue-600">Koçluk Paneli</Text>
          <Text className="text-slate-500 mt-2 text-center">Öğrenci takip sistemine hoş geldiniz</Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-slate-700 mb-2 font-medium">E-posta Adresi</Text>
            <TextInput
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
              placeholder="koc@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>

          <View className="mt-4">
            <Text className="text-slate-700 mb-2 font-medium">Şifre</Text>
            <TextInput
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            onPress={handleLogin}
            className="bg-blue-600 p-4 rounded-xl mt-6 shadow-md shadow-blue-300"
          >
            <Text className="text-white text-center font-bold text-lg">Giriş Yap</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-slate-400 mt-8 text-xs">
          V 1.0.0 - Kişiye Özel Koçluk Sistemi
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
