import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Start from "./components/Start";
import Chat from "./components/Chat";
import { initializeApp } from "firebase/app";
import {
  disableNetwork,
  enableNetwork,
  getFirestore,
} from "firebase/firestore";
import { useNetInfo } from "@react-native-community/netinfo";
import { useEffect } from "react";
import { Alert } from "react-native";

const Stack = createNativeStackNavigator();

const App = () => {
  const connectionStatus = useNetInfo();

  // Disable Firestore when there is no internet connection
  useEffect(() => {
    if (connectionStatus.isConnected === false) {
      Alert.alert("Connection lost!");
      disableNetwork(db);
    } else if (connectionStatus.isConnected === true) {
      enableNetwork(db);
    }
  }, [connectionStatus.isConnected]);

  //Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCYVt0FUfUoFvR9110fTz06SG6y56r3StQ",
    authDomain: "let-s-chat-5fe86.firebaseapp.com",
    projectId: "let-s-chat-5fe86",
    storageBucket: "let-s-chat-5fe86.firebasestorage.app",
    messagingSenderId: "745886345642",
    appId: "1:745886345642:web:65dde2a0896fa9fb8263d3",
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Initialize Cloud Firestore and get a reference to the service
  const db = getFirestore(app);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen name="Start" component={Start} />
        <Stack.Screen name="Chat">
          {(props) => (
            <Chat
              isConnected={connectionStatus.isConnected}
              db={db}
              {...props}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
