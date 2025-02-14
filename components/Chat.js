import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

const Chat = ({route, navigation}) => {
const backgroundColor = route.params.backgroundColor;
const name = route.params.name;

useEffect(()=> {
  // Sets the username as navigation bar title
  navigation.setOptions({title: name})
}, [])

  return (
    <View style={[styles.container, {backgroundColor: backgroundColor}]}>
      <Text>This is the Chat</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Chat;
