import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function Page() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold mb-4">Sistem Hazır</Text>
      <TouchableOpacity 
        onPress={() => router.replace('/login')}
        className="bg-blue-600 p-4 rounded-xl"
      >
        <Text className="text-white">Giriş Ekranına Git</Text>
      </TouchableOpacity>
    </View>
  );
}
