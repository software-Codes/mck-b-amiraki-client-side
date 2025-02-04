import { Stack } from 'expo-router';



// Prevent the splash screen from auto-hiding before asset loading is complete.

const Layout = () => {


  return (
      <Stack>
          <Stack.Screen name="welcome" options={{ headerShown: false }} /> 
          <Stack.Screen name="membersignup" options={{ headerShown: false }} />
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
          <Stack.Screen name="adminsignup" options={{ headerShown: false }} />

      </Stack>
  );
}

export default Layout;
