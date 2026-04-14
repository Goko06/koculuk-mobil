import { useLocalSearchParams, useRouter } from 'expo-router';
import { BookOpen, ChevronLeft, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
// --- WEB PROJESİNDEKİ MÜFREDAT HAVUZU ---
const CURRICULUM_POOL: any = {
  "5": {
    "Türkçe": ["Sözcükte Anlam", "Cümlede Anlam", "Parçada Anlam", "Yazım Kuralları", "Noktalama İşaretleri", "Metin Türleri", "Söz Sanatları"],
    "Matematik": ["Doğal Sayılar", "Doğal Sayılarla İşlemler", "Kesirler", "Kesirlerle İşlemler", "Ondalık Gösterim", "Yüzdeler", "Temel Geometrik Kavramlar", "Uzunluk ve Zaman Ölçme", "Veri İşleme", "Alan Ölçme", "Geometrik Cisimler"],
    "Fen Bilimleri": ["Güneş, Dünya ve Ay", "Canlılar Dünyası", "Kuvvetin Ölçülmesi ve Sürtünme", "Madde ve Değişim", "Işığın Yayılması", "İnsan ve Çevre", "Elektrik Devre Elemanları"],
    "Sosyal Bilgiler": ["Birey ve Toplum", "Kültür ve Miras", "İnsanlar, Yerler ve Çevreler", "Bilim, Teknoloji ve Toplum", "Üretim, Dağıtım ve Tüketim", "Etkin Vatandaşlık", "Küresel Bağlantılar"],
    "İngilizce": ["Hello!", "My Town", "Games and Hobbies", "My Daily Routine", "Health", "Movies", "Party Time", "Fitness", "The Animal Shelter", "Festivals"],
    "Din Kültürü": ["Allah İnancı", "Ramazan ve Kurban", "Adap ve Nezaket", "Hz. Muhammed ve Aile Hayatı", "Çevremizde Dinin İzleri"]
  },
  "6": {
    "Türkçe": ["Sözcükte Anlam", "Cümlede Anlam", "Parçada Anlam", "Sözcük Yapısı", "İsimler", "Zamirler", "Sıfatlar", "Edat-Bağlaç-Ünlem", "Yazım-Noktalama"],
    "Matematik": ["Doğal Sayılarla İşlemler", "Çarpanlar ve Katlar", "Kümeler", "Tam Sayılar", "Kesirlerle İşlemler", "Ondalık Gösterim", "Oran", "Cebirsel İfadeler", "Veri Analizi", "Açılar", "Alan Ölçme", "Çember", "Geometrik Cisimler", "Sıvı Ölçme"],
    "Fen Bilimleri": ["Güneş Sistemi ve Tutulmalar", "Vücudumuzdaki Sistemler", "Kuvvet ve Hareket", "Madde ve Isı", "Ses ve Özellikleri", "Vücudumuzdaki Sistemler ve Sağlığı", "Elektriğin İletimi"],
    "Sosyal Bilgiler": ["Biz ve Değerlerimiz", "Tarihe Yolculuk", "Yeryüzünde Yaşam", "Bilim, Teknoloji ve Toplum", "Üretim, Dağıtım ve Tüketim", "Etkin Vatandaşlık", "Uluslararası İlişkiler"],
    "İngilizce": ["Life", "Yummy Breakfast", "Downtown", "Weather and Emotions", "At the Fair", "Vacation", "Occupations", "Detectives at Work", "Saving the Planet", "Democracy"],
    "Din Kültürü": ["Peygamber ve İlahi Kitap İnancı", "Namaz", "Zararlı Alışkanlıklar", "Hz. Muhammed'in Hayatı", "Temel Hak ve Özgürlükler"]
  },
  "7": {
    "Türkçe": ["Fiiller (Anlam, Kip, Kişi)", "Ek Fiil", "Zarflar", "Sözcükte Anlam", "Cümlede Anlam", "Parçada Anlam", "Yazım-Noktalama", "Anlatım Bozuklukları"],
    "Matematik": ["Tam Sayılarla İşlemler", "Rasyonel Sayılar", "Rasyonel Sayılarla İşlemler", "Cebirsel İfadeler", "Eşitlik ve Denklem", "Oran ve Orantı", "Yüzdeler", "Doğrular ve Açılar", "Çokgenler", "Çember ve Daire", "Veri İşleme", "Geometrik Cisimler"],
    "Fen Bilimleri": ["Güneş Sistemi ve Ötesi", "Hücre ve Bölünmeler", "Kuvvet ve Enerji", "Saf Madde ve Karışımlar", "Işığın Madde ile Etkileşimi", "Canlılarda Üreme, Büyüme ve Gelişme", "Elektrik Devreleri"],
    "Sosyal Bilgiler": ["Birey ve Toplum", "Kültür ve Miras", "İnsanlar, Yerler ve Çevreler", "Bilim, Teknoloji ve Toplum", "Üretim, Dağıtım ve Tüketim", "Etkin Vatandaşlık", "Küresel Bağlantılar"],
    "İngilizce": ["Appearance and Personality", "Sports", "Biographies", "Wild Animals", "Television", "Celebrations", "Dreams", "Public Buildings", "Environment", "Planets"],
    "Din Kültürü": ["Melek ve Ahiret İnancı", "Hac ve Kurban", "Ahlaki Davranışlar", "Hz. Muhammed (Allah'ın Elçisi)", "İslam Düşüncesinde Yorumlar"]
  },
  "8": {
    "Türkçe": ["Fiilimsiler", "Cümlenin Ögeleri", "Sözcükte Anlam", "Cümlede Anlam", "Parçada Anlam", "Söz Sanatları", "Yazım Kuralları", "Noktalama İşaretleri", "Metin Türleri", "Anlatım Bozuklukları"],
    "Matematik": ["Çarpanlar ve Katlar", "Üslü İfadeler", "Kareköklü İfadeler", "Veri Analizi", "Olasılık", "Cebirsel İfadeler ve Özdeşlikler", "Doğrusal Denklemler", "Eşitsizlikler", "Üçgenler", "Eşlik ve Benzerlik", "Dönüşüm Geometrisi", "Geometrik Cisimler"],
    "Fen Bilimleri": ["Mevsimler ve İklim", "DNA ve Genetik Kod", "Basınç", "Madde ve Endüstri", "Basit Makineler", "Enerji Dönüşümleri ve Çevre", "Elektrik Yükleri ve Enerji"],
    "İnkılap Tarihi": ["Bir Kahraman Doğuyor", "Milli Uyanış", "Ya İstiklal Ya Ölüm", "Atatürkçülük", "Demokratikleşme Çabaları", "Dış Politika", "Atatürk'ün Ölümü"],
    "İngilizce": ["Friendship", "Teen Life", "In the Kitchen", "On the Phone", "The Internet", "Adventures", "Tourism", "Chores", "Science", "Natural Forces"],
    "Din Kültürü": ["Kader İnancı", "Zekat ve Sadaka", "Din ve Hayat", "Hz. Muhammed'in Örnekliği", "Kur'an-ı Kerim ve Özellikleri"]
  },
  "9": {
    "Edebiyat": ["Edebiyata Giriş", "Hikaye", "Şiir", "Masal/Fabl", "Roman", "Tiyatro", "Biyografi", "Mektup"],
    "Matematik": ["Mantık", "Kümeler", "Denklemler ve Eşitsizlikler", "Üçgenler", "Veri"],
    "Fizik": ["Fizik Bilimine Giriş", "Madde ve Özellikleri", "Hareket ve Kuvvet", "Enerji", "Isı ve Sıcaklık", "Elektrostatik"],
    "Kimya": ["Kimya Bilimi", "Atom ve Periyodik Sistem", "Kimyasal Türler Arası Etkileşimler", "Maddenin Halleri", "Doğa ve Kimya"],
    "Biyoloji": ["Yaşam Bilimi", "Hücre", "Canlılar Dünyası"],
    "Tarih": ["Tarih ve Zaman", "İlk Çağ Medeniyetleri", "Orta Çağ", "İlk Türk Devletleri", "İslam Medeniyeti"],
    "Coğrafya": ["Doğa ve İnsan", "Dünya'nın Şekli ve Hareketleri", "Harita Bilgisi", "Atmosfer ve İklim"]
  },
  "10": {
    "Edebiyat": ["Halk Edebiyatı", "Divan Edebiyatı", "Destan/Efsane", "Roman", "Tiyatro", "Anı", "Haber Metni"],
    "Matematik": ["Sayma ve Olasılık", "Fonksiyonlar", "Polinomlar", "İkinci Dereceden Denklemler", "Çokgenler ve Dörtgenler", "Uzay Geometri"],
    "Fizik": ["Elektrik ve Manyetizma", "Basınç ve Kaldırma Kuvveti", "Dalgalar", "Optik"],
    "Kimya": ["Kimyanın Temel Kanunları", "Karışımlar", "Asit-Baz-Tuz", "Kimya Her Yerde"],
    "Biyoloji": ["Hücre Bölünmeleri", "Kalıtım", "Ekosistem Ekolojisi"],
    "Tarih": ["Selçuklu Tarihi", "Osmanlı Kuruluş ve Yükselme", "Dünya Gücü Osmanlı"],
    "Coğrafya": ["Yer'in İç Yapısı", "Su Kaynakları", "Topraklar", "Bitkiler", "Nüfus"]
  },
  "11": {
    "Edebiyat": ["Edebiyat ve Toplum", "Hikaye", "Şiir", "Makale", "Sohbet", "Roman", "Tiyatro", "Eleştiri"],
    "Matematik": ["Trigonometri", "Analitik Geometri", "Fonksiyon Uygulamaları", "Denklem Sistemleri", "Çember ve Daire", "Uzay Geometri", "Olasılık"],
    "Fizik": ["Kuvvet ve Hareket (Vektörler, Newton)", "Elektrik ve Manyetizma"],
    "Kimya": ["Modern Atom Teorisi", "Gazlar", "Sıvı Çözeltiler", "Enerji", "Hız", "Denge"],
    "Biyoloji": ["İnsan Fizyolojisi (Sistemler)", "Popülasyon Ekolojisi"],
    "Tarih": ["Yeni Çağ Avrupası", "Osmanlı Gerileme ve Reformlar", "Modernleşen Türkiye"],
    "Coğrafya": ["Biyoçeşitlilik", "Ekosistem", "Beşeri Sistemler", "Türkiye Ekonomisi"]
  },
  "TYT_CORE": {
    "Türkçe (TYT)": ["Sözcük Anlamı", "Cümle Anlamı", "Paragraf", "Ses Bilgisi", "Yazım Kuralları", "Noktalama", "Sözcük Yapısı", "Sözcük Türleri", "Cümlenin Ögeleri", "Cümle Türleri", "Anlatım Bozuklukları"],
    "Matematik (TYT)": ["Temel Kavramlar", "Basamak Analizi", "Bölme-Bölünebilme", "EBOB-EKOK", "Rasyonel Sayılar", "Eşitsizlikler", "Mutlak Değer", "Üslü-Köklü Sayılar", "Çarpanlara Ayırma", "Oran-Orantı", "Problemler", "Kümeler", "Fonksiyonlar", "Olasılık", "Polinomlar", "İkinci Dereceden Denklemler"],
    "Geometri (TYT)": ["Doğruda ve Üçgende Açılar", "Üçgenler", "Çokgenler", "Dörtgenler", "Çember ve Daire", "Analitik Geometri", "Katı Cisimler"],
    "Fizik (TYT)": ["Madde ve Özellikleri", "Hareket ve Kuvvet", "Enerji", "Isı ve Sıcaklık", "Elektrostatik", "Basınç ve Kaldırma Kuvveti", "Dalgalar", "Optik"],
    "Kimya (TYT)": ["Kimya Bilimi", "Atom ve Periyodik Sistem", "Kimyasal Türler Arası Etkileşimler", "Maddenin Halleri", "Kimyanın Temel Kanunları", "Karışımlar", "Asit-Baz-Tuz"],
    "Biyoloji (TYT)": ["Yaşam Bilimi", "Hücre", "Canlılar Dünyası", "Hücre Bölünmeleri", "Kalıtım", "Ekoloji"],
    "Tarih (TYT)": ["Tarih ve Zaman", "Türk Tarihi", "İslam Tarihi", "Osmanlı Tarihi", "İnkılap Tarihi"],
    "Coğrafya (TYT)": ["Doğa ve İnsan", "Dünya'nın Şekli", "Harita Bilgisi", "İklim", "İç ve Dış Kuvvetler", "Nüfus", "Bölgeler"],
    "Felsefe (TYT)": ["Felsefeyi Tanıma", "Bilgi-Varlık-Ahlak-Siyaset-Din-Sanat Felsefesi"],
    "Din Kültürü (TYT)": ["İnanç-İbadet-Ahlak", "Peygamberler", "Din ve Hayat"]
  },
  "AYT_SAY": {
    "Matematik (AYT)": ["Trigonometri", "Logaritma", "Diziler", "Limit ve Süreklilik", "Türev", "İntegral"],
    "AYT Geometri": ["Analitik Geometri", "Dönüşüm Geometrisi", "Çemberin Analitiği", "Uzay Geometri (Prizma-Piramit)", "Vektörler", "Trigonometri-2"],
    "Fizik (AYT)": ["Vektörler", "Bağıl Hareket", "Newton Yasaları", "Atışlar", "Enerji ve Momentum", "Tork ve Denge", "Elektriksel Kuvvet", "Manyetizma", "Çembersel Hareket", "Harmonik Hareket", "Modern Fizik"],
    "Kimya (AYT)": ["Modern Atom Teorisi", "Gazlar", "Sıvı Çözeltiler", "Kimyasal Enerji", "Tepkime Hızı", "Kimyasal Denge", "Asit-Baz Dengesi", "Kimya ve Elektrik", "Karbon Kimyasına Giriş", "Organik Bileşikler"],
    "Biyoloji (AYT)": ["Denetleyici Sistemler", "Duyu Organları", "Destek ve Hareket", "Sindirim-Dolaşım-Solunum-Boşaltım", "Genden Proteine", "Canlılarda Enerji Dönüşümü", "Bitki Biyolojisi"]
  },
  "AYT_EA": {
    "Matematik (AYT)": ["Trigonometri", "Logaritma", "Diziler", "Limit-Türev-İntegral"],
    "AYT Geometri": ["Analitik Geometri", "Dönüşüm Geometrisi", "Çemberin Analitiği", "Uzay Geometri (Prizma-Piramit)", "Vektörler", "Trigonometri-2"],
    "Edebiyat (AYT)": ["Şiir Bilgisi", "Edebi Sanatlar", "İslamiyet Öncesi-Halk-Divan Edebiyatı", "Tanzimat-Servet-i Fünun-Milli Edebiyat", "Cumhuriyet Dönemi Türk Edebiyatı", "Yazar-Eser"],
    "Tarih-1 (AYT)": ["Osmanlı Tarihi (Tamam)", "20. Yüzyıl Başlarında Dünya", "I. Dünya Savaşı", "Kurtuluş Savaşı", "Cumhuriyet İnkılapları"],
    "Coğrafya-1 (AYT)": ["Ekosistem", "Nüfus Politikaları", "Türkiye Ekonomisi", "Türkiye'nin Jeopolitiği", "Küresel Ticaret"],
    "Tarih-2 (Sözel)": ["Tarih Bilimine Giriş", "Uygarlığın Doğuşu", "İlk Türk İslam Devletleri", "Osmanlı Kültür ve Medeniyet", "Dünya Gücü Osmanlı", "Arayış Yılları", "En Uzun Yüzyıl", "20. Yüzyıl Başlarında Dünya", "II. Dünya Savaşı", "Soğuk Savaş Dönemi", "Yumuşama Dönemi", "Küreselleşen Dünya"],
    "Coğrafya-2": ["Ekosistemlerin İşleyişi", "Nüfus Politikaları", "Ekonomik Faaliyetler", "Türkiye'nin İşlevsel Bölgeleri", "Küresel Ortam ve Ülkeler", "Çevre ve Toplum"]
  }
};

export default function StudentDetail() {
  const { id, name } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [targetQuestions, setTargetQuestions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. fetchData'yı Dışarı Çıkardık (Artık her yerden çağrılabilir)
  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data: sData } = await supabase.from('profiles').select('*').eq('user_id', id).maybeSingle();
      setStudent(sData);
      const { data: tData } = await supabase.from('student_tasks').select('*').eq('student_id', sData?.id).order('created_at', { ascending: false });
      setTasks(tData || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentCurriculum = useMemo(() => {
    if (!student) return {};
    const level = (student.class_level || "").toLowerCase();
    const match = level.match(/\d+/);
    const gradeNum = match ? match[0] : null;
    if (gradeNum && CURRICULUM_POOL[gradeNum]) return CURRICULUM_POOL[gradeNum];
    if (level.includes("12") || level.includes("mezun")) {
      const tyt = CURRICULUM_POOL["TYT_CORE"] || {};
      let ayt = level.includes("sayısal") ? CURRICULUM_POOL["AYT_SAY"] : (level.includes("ea") || level.includes("eşit")) ? CURRICULUM_POOL["AYT_EA"] : {};
      return { ...tyt, ...ayt };
    }
    return {};
  }, [student]);

  const subjects = Object.keys(currentCurriculum);
  const topics = selectedSubject ? (currentCurriculum[selectedSubject] || []) : [];

  // 2. handleAddTask Güncellendi (Foreign Key ve fetchData uyumlu)
  const handleAddTask = async () => {
    if (!selectedSubject || !selectedTopic || !targetQuestions) return Alert.alert("Hata", "Eksik alan!");
    if (!student?.id) return Alert.alert("Hata", "Öğrenci kimliği bulunamadı.");

    setIsSubmitting(true);
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      const dateOnly = dueDate.toISOString().split('T')[0];

      const { error } = await supabase.from('student_tasks').insert([{ 
        student_id: student.id, // Profiles tablosundaki asıl PK ID'si
        topic_name: `${selectedSubject} - ${selectedTopic}`, 
        target_questions: parseInt(targetQuestions),
        status: 'pending',
        due_date: dateOnly
      }]);

      if (error) throw error;
      setShowForm(false);
      fetchData(); // Artık hata vermez!
    } catch (e: any) { Alert.alert("Hata", e.message); } finally { setIsSubmitting(false); }
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#2563eb" /></View>;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><ChevronLeft size={24} color="black" /></TouchableOpacity>
          <Text style={s.title}>{name}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowForm(true)} style={s.addBtn}><Text style={s.addBtnText}>+ GÖREV TANIMLA</Text></TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }}>
        {tasks.map((t, idx) => (
          <View key={idx} style={s.card}>
            <View style={s.cardIcon}><BookOpen size={18} color="#2563eb" /></View>
            <View style={{flex:1, marginLeft:15}}>
              <Text style={s.cardTitle}>{t.topic_name}</Text>
              <Text style={s.cardSub}>{t.target_questions} Soru • {t.due_date}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {showForm && (
        <View style={s.overlay}>
          <View style={s.modal}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Yeni Görev</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}><X size={24} color="black" /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.label}>DERS SEÇ</Text>
              <View style={s.subjectList}>
                {subjects.map(sub => (
                  <TouchableOpacity key={sub} onPress={() => {setSelectedSubject(sub); setSelectedTopic('');}} 
                    style={[s.chip, selectedSubject === sub && s.chipActive]}>
                    <Text style={[s.chipText, selectedSubject === sub && s.chipTextActive]}>{sub}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedSubject && (
                <View style={s.topicList}>
                  {topics.map((top: string) => (
                    <TouchableOpacity key={top} onPress={() => setSelectedTopic(top)} 
                      style={[s.topicItem, selectedTopic === top && s.topicItemActive]}>
                      <Text style={selectedTopic === top ? {color:'#2563eb', fontWeight:'bold'} : {color:'#64748b'}}>{top}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <TextInput style={s.input} placeholder="Soru Sayısı" keyboardType="numeric" value={targetQuestions} onChangeText={setTargetQuestions} />
              <TouchableOpacity onPress={handleAddTask} style={s.submitBtn}>
                {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={s.submitText}>KAYDET</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 25, paddingTop: 60, backgroundColor: 'white', borderBottomLeftRadius: 35, borderBottomRightRadius: 35, elevation: 5 },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { padding: 10, backgroundColor: '#f1f5f9', borderRadius: 15 },
  title: { fontSize: 20, fontWeight: '900', marginLeft: 15 },
  addBtn: { backgroundColor: '#2563eb', padding: 16, borderRadius: 20, alignItems: 'center' },
  addBtnText: { color: 'white', fontWeight: 'bold' },
  card: { backgroundColor: 'white', padding: 18, borderRadius: 25, marginBottom: 15, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  cardIcon: { padding: 12, backgroundColor: '#eff6ff', borderRadius: 18 },
  cardTitle: { fontWeight: 'bold', fontSize: 13, color: '#1e293b' },
  cardSub: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 99, justifyContent: 'flex-end' },
  modal: { backgroundColor: 'white', height: '80%', borderTopLeftRadius: 50, borderTopRightRadius: 50, padding: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 22, fontWeight: 'bold' },
  label: { fontSize: 10, fontWeight: '900', color: '#94a3b8', marginBottom: 12 },
  subjectList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 25 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: '#f1f5f9' },
  chipActive: { backgroundColor: '#0f172a' },
  chipText: { fontSize: 12, color: '#64748b' },
  chipTextActive: { color: 'white' },
  topicList: { backgroundColor: '#f8fafc', padding: 8, borderRadius: 20, marginBottom: 25 },
  topicItem: { padding: 15, borderRadius: 15, marginBottom: 5 },
  topicItemActive: { backgroundColor: 'white' },
  input: { backgroundColor: '#f1f5f9', padding: 18, borderRadius: 20, fontWeight: 'bold', marginBottom: 25 },
  submitBtn: { backgroundColor: '#2563eb', padding: 22, borderRadius: 25, alignItems: 'center' },
  submitText: { color: 'white', fontWeight: '900' }
});