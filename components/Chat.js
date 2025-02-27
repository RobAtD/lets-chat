import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import {
  Bubble,
  Day,
  GiftedChat,
  SystemMessage,
} from "react-native-gifted-chat";

const Chat = ({ db, route, navigation }) => {
  // Get the user params
  const { userID, backgroundColor, name } = route.params;
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Sets the username as navigation bar title
    navigation.setOptions({ title: name });

    // Query that sorts the messages in descending order for the Snapshot
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));

    // Snapshot that targets the messages db through the defined query
    const unsubMessages = onSnapshot(q, (documentsSnapshot) => {
      let newMessages = [];
      documentsSnapshot.forEach((doc) => {
        newMessages.push({
          id: doc.id,
          ...doc.data(),
          createdAt: new Date(doc.data().createdAt.toMillis()),
        });
      });
      setMessages(newMessages);
    });
    return () => {
      if (unsubMessages) unsubMessages();
    };
  }, []);

  /**
   * Handler to append new messages to the messages array
   * @param newMessages The new messages to append to the messages array
   */
  const onSend = (newMessages) => {
    addDoc(collection(db, "messages"), newMessages[0]);
  };

  /**
   * Handler to customize the chat bubbles
   * @param props The default props of of <Bubble>
   * @returns Custom Chat Bubbles
   */
  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#000",
          },
          left: {
            backgroundColor: "#fff",
          },
        }}
      />
    );
  };

  /**
   * Handler to customize the system message
   * @param props The default props of of <SystemMessage>
   * @returns Custom SystemMessage
   */
  const renderSystemMessage = (props) => {
    return (
      <SystemMessage
        {...props}
        textStyle={{
          color: "white",
        }}
      />
    );
  };

  /**
   * Handler to customize the day text above the messages
   * @param props The default props of of <Day>
   * @returns Custom Day text above messages
   */
  const renderDay = (props) => {
    return (
      <Day
        {...props}
        textStyle={{
          color: "white",
        }}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
      <GiftedChat
        messages={messages}
        renderBubble={renderBubble}
        renderSystemMessage={renderSystemMessage}
        renderDay={renderDay}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: userID,
          name: name,
        }}
      />
      {Platform.OS === "android" ? (
        <KeyboardAvoidingView behavior="height" />
      ) : null}
      {Platform.OS === "ios" ? (
        <KeyboardAvoidingView behavior="padding" />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Chat;
