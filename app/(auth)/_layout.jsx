import { Stack } from 'expo-router'

const _layout = () => {
  return (
    <Stack>
        <Stack.Screen name='Welcome' options={{headerShown: false}}/>
        <Stack.Screen name='signUp'options={{headerShown: false}}/>
        <Stack.Screen name='login' options={{headerShown: false}}/> 
    </Stack>
  )
}

export default _layout