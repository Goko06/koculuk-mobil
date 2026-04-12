import { Redirect } from 'expo-router';

export default function Index() {
  // Kullanıcı giriş yapmamışsa direkt login'e gönder
  // Şimdilik test için herkesi login'e yönlendirelim:
  return <Redirect href="/login" />;
}
