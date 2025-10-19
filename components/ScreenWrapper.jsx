import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ScreenWrapper({children,bg}) {
    const {top} = useSafeAreaInsets();
    const paddingTop = top > 0 ? 'pt-5' : 'pt-10';
  return (
    <SafeAreaView className={`bg-${bg} flex-1 ${paddingTop}`}>
      {children}
    </SafeAreaView>
  )
}