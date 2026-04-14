import { useRouter } from 'expo-router';
import { ChevronDown, ChevronLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

const CLASS_OPTIONS = [
  "5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf (LGS)",
  "9. Sınıf", "10. Sınıf", "11. Sınıf",
  "12. Sınıf (Sayısal)", "12. Sınıf (Eşit Ağırlık)", "12. Sınıf (Sözel)", "12. Sınıf (Dil)",
  "Mezun (Sayısal)", "Mezun (Eşit Ağırlık)", "Mezun (Sözel)", "Mezun (Dil)"
];

export default function AddStudent() {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', classLevel: '' });
  const router = useRouter();

  const handleCreate = async () => {
  if (!form.email || !form.password || !form.fullName || !form.classLevel) {
    return Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
  }
  
  setLoading(true);
  try {
    // --- KRİTİK ADIM 1: KOÇUN ID'SİNİ HER ŞEYDEN ÖNCE SABİTLE ---
    const { data: { user: currentCoach } } = await supabase.auth.getUser();
    
    if (!currentCoach) throw new Error("Koç oturumu bulunamadı. Lütfen tekrar giriş yapın.");
    
    const fixedCoachId = currentCoach.id; // Koçun ID'sini burada bir değişkene hapsettik.
    console.log("Kayıt Yapan Koçun ID'si (Sabitlendi):", fixedCoachId);

    // --- 2. ADIM: ÖĞRENCİYİ OLUŞTUR ---
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        // Otomatik girişi engellemek için (Eğer Supabase ayarların izin veriyorsa)
        // emailRedirectTo: '...' 
      }
    });

    if (authError) throw authError;

    // --- 3. ADIM: PROFİLİ EKLE ---
    // Burada 'fixedCoachId' değişkenini kullanarak veritabanına yazıyoruz.
    const { error: profileError } = await supabase.from('profiles').insert([
      {
        user_id: authData.user?.id,
        full_name: form.fullName,
        role: 'student',
        class_level: form.classLevel,
        coach_id: fixedCoachId, // Artık yeni öğrencinin ID'siyle karışmaz!
        status: 'active'
      }
    ]);

    if (profileError) throw profileError;

    Alert.alert("Başarılı", "Öğrenci oluşturuldu ve size bağlandı.");
    router.back();
    
  } catch (e: any) {
    console.error("Hata Detayı:", e);
    Alert.alert("Kayıt Hatası", e.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView className="flex-1 bg-[#f8fafc] p-6">
      <View className="flex-row items-center mt-8 mb-8">
        <TouchableOpacity onPress={() => router.back()} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
          <ChevronLeft size={24} color="black" />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-black italic uppercase tracking-tighter">Öğrenci Kaydı</Text>
      </View>

      <View className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 space-y-5">
        <TextInput 
          className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold"
          placeholder="Öğrenci Ad Soyad"
          onChangeText={(t) => setForm({...form, fullName: t})}
        />
        <TextInput 
          className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold"
          placeholder="E-posta"
          autoCapitalize="none"
          onChangeText={(t) => setForm({...form, email: t})}
        />
        <TextInput 
          className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold"
          placeholder="Şifre"
          secureTextEntry
          onChangeText={(t) => setForm({...form, password: t})}
        />
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex-row justify-between items-center"
        >
          <Text className={`font-bold ${form.classLevel ? 'text-blue-700' : 'text-blue-300'}`}>
            {form.classLevel || "Sınıf Seçin"}
          </Text>
          <ChevronDown size={20} color="#2563eb" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleCreate}
          disabled={loading}
          className="bg-blue-600 p-6 rounded-[2rem] items-center mt-4"
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-black uppercase italic tracking-widest">Öğrenciyi Kaydet</Text>}
        </TouchableOpacity>
      </View>

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white rounded-t-[3rem] p-6 max-h-[70%]">
            <ScrollView showsVerticalScrollIndicator={false}>
              {CLASS_OPTIONS.map((item) => (
                <TouchableOpacity 
                  key={item}
                  onPress={() => { setForm({...form, classLevel: item}); setModalVisible(false); }}
                  className={`p-5 rounded-2xl mb-2 ${form.classLevel === item ? 'bg-blue-600' : 'bg-slate-50'}`}
                >
                  <Text className={`font-bold ${form.classLevel === item ? 'text-white' : 'text-slate-700'}`}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
