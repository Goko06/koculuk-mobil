import { Text, View } from 'react-native';

export default function TestScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-900">
      <View className="p-6 bg-blue-600 rounded-2xl shadow-lg">
        <Text className="text-white text-2xl font-bold text-center">
          Koçluk Uygulaması 🚀
        </Text>
        <Text className="text-blue-100 mt-2 text-center">
          Tailwind Mobilde Çalışıyor!
        </Text>
      </View>
    </View>
  );
}
