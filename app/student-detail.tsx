import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, ChevronLeft, Clock, Plus, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LineChart } from "react-native-gifted-charts";
import { supabase } from '../lib/supabase';

const screenWidth = Dimensions.get('window').width;

export default function StudentDetail() {
  const { id, name } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [dailyEntries, setDailyEntries] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([{value: 0, label: ''}]);
  const [maxVal, setMaxVal] = useState(100);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  // Form State
  const [topicName, setTopicName] = useState('');
  const [targetQuestions, setTargetQuestions] = useState('');

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data: sData } = await supabase.from('profiles').select('*').eq('user_id', id).single();
      setStudent(sData);

      const [tasksRes, dailyRes] = await Promise.all([
        supabase.from('student_tasks').select('*').eq('student_id', id).order('created_at', { ascending: false }),
        supabase.from('daily_entries').select('*').eq('student_id', id).order('entry_date', { ascending: true }).limit(7)
      ]);

      setTasks(tasksRes.data || []);
      
      const processedDaily = (dailyRes.data || []).map(entry => {
        let sData = entry.subjects_data;
        if (typeof sData === 'string') {
          try { sData = JSON.parse(sData); } catch { sData = { studies: [] }; }
        }
        let solvedSum = entry.total_solved_questions || 0;
        if (solvedSum === 0 && sData.studies) {
          solvedSum = sData.studies.reduce((acc: number, curr: any) => acc + (Number(curr.solved) || 0), 0);
        }
        return { ...entry, data: sData, finalSolved: solvedSum };
      });

      setDailyEntries([...processedDaily].reverse());

      if (processedDaily.length > 0) {
        const gData = processedDaily.map(item => ({
          value: Number(item.finalSolved) || 0,
          label: new Date(item.entry_date).toLocaleDateString('tr-TR', { weekday: 'short' }),
        }));
        setChartData(gData);
        const highest = Math.max(...gData.map(d => d.value));
        setMaxVal(highest > 0 ? highest * 1.2 : 100);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddTask = async () => {
    if (!topicName || !targetQuestions) return Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
    
    try {
      const { error } = await supabase.from('student_tasks').insert([
        { 
          student_id: id, 
          topic_name: topicName, 
          target_questions: parseInt(targetQuestions),
          status: 'pending'
        }
      ]);

      if (error) throw error;
      
      Alert.alert("Başarılı", "Yeni görev atandı.");
      setModalVisible(false);
      setTopicName('');
      setTargetQuestions('');
      fetchData(); // Listeyi yenile
    } catch (error: any) {
      Alert.alert("Hata", error.message);
    }
  };

  if (loading) return (
    <View className="flex-1 justify-center items-center bg-white"><ActivityIndicator size="large" color="#2563eb" /></View>
  );

  return (
    <ScrollView className="flex-1 bg-slate-50">
      {/* HEADER */}
      <View className="bg-white p-6 pt-12 shadow-sm rounded-b-[3rem]">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.back()} className="p-3 bg-slate-100 rounded-2xl">
            <ChevronLeft size={24} color="#1e293b" />
          </TouchableOpacity>
          <View className="items-end">
            <Text className="text-2xl font-black italic uppercase text-slate-800">{name}</Text>
            <Text className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full mt-1">Analiz Paneli</Text>
          </View>
        </View>

        {/* GRAFİK */}
        <View className="mt-2 items-center bg-slate-50 p-5 rounded-[2.5rem] border border-slate-100">
          <LineChart
            data={chartData}
            height={140}
            width={screenWidth - 110}
            maxValue={maxVal}
            noOfSections={4}
            spacing={40}
            color="#2563eb"
            thickness={4}
            isAnimated
            curved
            dataPointsColor="#1e293b"
            yAxisTextStyle={{color: '#94a3b8', fontSize: 10}}
            xAxisLabelTextStyle={{color: '#94a3b8', fontSize: 9, fontWeight: 'bold'}}
            yAxisThickness={0}
            xAxisThickness={0}
          />
        </View>
      </View>

      <View className="p-4 space-y-6">
        {/* HAFTALIK GÖREVLER */}
        <View className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="font-black italic uppercase text-slate-800">Haftalık Görevler</Text>
            <TouchableOpacity 
              onPress={() => setModalVisible(true)}
              className="bg-blue-600 p-3 rounded-2xl flex-row items-center"
            >
              <Plus size={16} color="white" />
              <Text className="text-white font-black text-[10px] uppercase ml-1">Ekle</Text>
            </TouchableOpacity>
          </View>
          
          {tasks.map((task) => (
            <View key={task.id} className="flex-row items-center gap-4 mb-3 bg-slate-50 p-4 rounded-3xl border border-slate-100">
              <View className={`p-3 rounded-2xl ${task.status === 'completed' ? 'bg-green-100' : 'bg-amber-100'}`}>
                {task.status === 'completed' ? <CheckCircle2 size={18} color="#16a34a" /> : <Clock size={18} color="#d97706" />}
              </View>
              <View className="flex-1">
                <Text className="font-black text-slate-700 text-xs uppercase italic">{task.topic_name}</Text>
                <Text className="text-[9px] text-slate-400 font-bold uppercase mt-1">{task.target_questions} Soru Hedefi</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* ÖDEV EKLEME MODAL */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[3rem] p-8">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-black italic uppercase">Yeni Görev Ata</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-slate-100 rounded-full">
                <X size={20} color="black" />
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Konu Başlığı</Text>
              <TextInput 
                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold mb-4"
                placeholder="Örn: Üslü Sayılar"
                value={topicName}
                onChangeText={setTopicName}
              />

              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Soru Hedefi</Text>
              <TextInput 
                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold mb-6"
                placeholder="Örn: 100"
                keyboardType="numeric"
                value={targetQuestions}
                onChangeText={setTargetQuestions}
              />

              <TouchableOpacity 
                onPress={handleAddTask}
                className="bg-blue-600 p-5 rounded-[2rem] items-center shadow-lg shadow-blue-300"
              >
                <Text className="text-white font-black uppercase italic tracking-widest">Görevi Atla</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
