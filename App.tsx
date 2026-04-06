import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/AppContext';
import type { RootStackParamList } from './src/navigation/types';
import { HomeScreen } from './src/screens/HomeScreen';
import { ContactsScreen } from './src/screens/ContactsScreen';
import { MessageScreen } from './src/screens/MessageScreen';
import { SendingScreen } from './src/screens/SendingScreen';
import { palette } from './src/theme/tokens';

const stack = createNativeStackNavigator<RootStackParamList>();

const appTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: palette.primary,
    secondary: palette.accent,
    surface: palette.surface,
    background: palette.background,
    onSurface: palette.textPrimary,
    onBackground: palette.textPrimary,
  },
};

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.background,
    card: palette.background,
    text: palette.textPrimary,
    border: palette.border,
    primary: palette.primary,
  },
};

export default function App() {
  return (
    <AppProvider>
      <SafeAreaProvider>
        <PaperProvider theme={appTheme}>
          <NavigationContainer theme={navTheme}>
            <stack.Navigator
              screenOptions={{
                headerStyle: { backgroundColor: palette.background },
                headerTintColor: palette.textPrimary,
                headerTitleStyle: { fontFamily: 'serif' },
                contentStyle: { backgroundColor: palette.background },
              }}
            >
              <stack.Screen name="Home" component={HomeScreen} options={{ title: 'SMS-app' }} />
              <stack.Screen name="Contacts" component={ContactsScreen} options={{ title: 'Välj kontakter' }} />
              <stack.Screen name="Message" component={MessageScreen} options={{ title: 'Meddelande' }} />
              <stack.Screen name="Sending" component={SendingScreen} options={{ title: 'Skicka SMS' }} />
            </stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </AppProvider>
  );
}
