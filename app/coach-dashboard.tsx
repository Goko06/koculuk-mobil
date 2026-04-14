import { useFocusEffect, useRouter } from 'expo-router';
import {
  Bell,
  ChevronRight,
  GraduationCap,
  LogOut, Search, ShieldPlus,
  TrendingUp,
  UserPlus,
  Users
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function CoachDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: pData } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      setProfile(pData);

      let query = supabase.from('profiles').select('*').eq('role', 'student');
      if (pData?.role !== 'admin' && pData?.role !== 'admin.coach') {
        query = query.eq('coach_id', user.id);
      }

      const { data: sData, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setStudents(sData || []);
    } catch (e) { 
      console.error("Dashboard Veri Hatası:", e); 
    } finally { 
      setLoading(false); 
      setRefreshing(false);
    }
  }, [refreshing]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !refreshing) return (
    <View style={s.center}><ActivityIndicator size="large" color="#2563eb" /></View>
  );

  return (
    <ScrollView 
      style={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563eb"]} />}
    >
      {/* ÜST BAR */}
      <View style={s.topBar}>
        <View>
          <Text style={s.greeting}>HOŞ GELDİN KOÇ</Text>
          <Text style={s.profileName}>{profile?.full_name?.toUpperCase()}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={s.iconBtn}><Bell size={20} color="#64748b" /></TouchableOpacity>
          <TouchableOpacity 
            onPress={() => supabase.auth.signOut().then(() => router.replace('/login'))} 
            style={[s.iconBtn, { backgroundColor: '#fee2e2' }]}
          >
            <LogOut size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ padding: 20 }}>
        {/* İSTATİSTİK KARTLARI */}
        <View style={s.statsRow}>
          <View style={[s.statCard, { backgroundColor: '#2563eb' }]}>
            <Users size={22} color="white" />
            <Text style={s.statNumber}>{students.length}</Text>
            <Text style={s.statLabel}>ÖĞRENCİLER</Text>
          </View>
          <View style={s.statCardWhite}>
            <TrendingUp size={22} color="#10b981" />
            <Text style={[s.statNumber, { color: '#1e293b' }]}>%88</Text>
            <Text style={s.statLabel}>ORT. BAŞARI</Text>
          </View>
        </View>

        {/* HIZLI AKSİYONLAR */}
        <View style={s.actionRow}>
          <TouchableOpacity onPress={() => router.push('/add-student')} style={s.actionBtnBlue}>
            <UserPlus size={18} color="white" />
            <Text style={s.actionBtnText}>ÖĞRENCİ EKLE</Text>
          </TouchableOpacity>

          {(profile?.role?.includes('admin')) && (
            <TouchableOpacity onPress={() => router.push('/add-coach')} style={s.actionBtnBlack}>
              <ShieldPlus size={18} color="white" />
              <Text style={s.actionBtnText}>KOÇ EKLE</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ARAMA */}
        <View style={s.searchContainer}>
          <Search size={20} color="#cbd5e1" style={s.searchIcon} />
          <TextInput 
            placeholder="İsim ile ara..." 
            style={s.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* LİSTE */}
        <Text style={s.sectionTitle}>KAYITLI ÖĞRENCİLER ({filteredStudents.length})</Text>
        
        <View style={{ gap: 12, paddingBottom: 40 }}>
          {filteredStudents.map((s) => (
            <TouchableOpacity 
              key={s.id} 
              onPress={() => router.push({ pathname: "/student-detail", params: { id: s.user_id, name: s.full_name }})}
              style={s.studentCard}
            >
              <View style={s.avatar}>
                <GraduationCap size={24} color="#2563eb" />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={s.studentName}>{s.full_name?.toUpperCase()}</Text>
                <Text style={s.studentMeta}>{s.class_level || "Sınıf Belirtilmedi"}</Text>
              </View>
              <ChevronRight size={18} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: { 
    paddingHorizontal: 25, 
    paddingTop: 60, 
    paddingBottom: 20, // pb hatası paddingBottom olarak düzeltildi
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    borderBottomWidth: 1, 
    borderColor: '#f1f5f9' 
  },
  greeting: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 1 },
  profileName: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  iconBtn: { padding: 10, backgroundColor: '#f1f5f9', borderRadius: 12 },
  statsRow: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  statCard: { flex: 1, padding: 20, borderRadius: 25, elevation: 4 },
  statCardWhite: { flex: 1, padding: 20, borderRadius: 25, backgroundColor: 'white', borderWidth: 1, borderColor: '#f1f5f9' },
  statNumber: { fontSize: 24, fontWeight: '900', color: 'white', marginTop: 8 },
  statLabel: { fontSize: 8, fontWeight: 'bold', color: '#94a3b8', marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  actionBtnBlue: { flex: 1, backgroundColor: '#2563eb', height: 55, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionBtnBlack: { flex: 1, backgroundColor: '#0f172a', height: 55, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionBtnText: { color: 'white', fontSize: 10, fontWeight: '900' },
  searchContainer: { position: 'relative', marginBottom: 25 },
  searchIcon: { position: 'absolute', left: 15, top: 15, zIndex: 10 },
  searchInput: { backgroundColor: 'white', height: 50, borderRadius: 15, paddingLeft: 45, fontWeight: 'bold', borderWidth: 1, borderColor: '#f1f5f9' },
  sectionTitle: { fontSize: 10, fontWeight: '900', color: '#94a3b8', marginBottom: 15, letterSpacing: 1 },
  studentCard: { backgroundColor: 'white', padding: 15, borderRadius: 22, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  avatar: { width: 50, height: 50, backgroundColor: '#eff6ff', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  studentName: { fontSize: 13, fontWeight: '900', color: '#1e293b' },
  studentMeta: { fontSize: 10, color: '#94a3b8', fontWeight: 'bold', marginTop: 3 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#cbd5e1', fontWeight: 'bold', fontSize: 12, fontStyle: 'italic' }
});
