import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Bubble, Day, GiftedChat, SystemMessage } from "react-native-gifted-chat";

const Chat = ({ route, navigation }) => {
  const backgroundColor = route.params.backgroundColor;
  const name = route.params.name;
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Sets the username as navigation bar title
    navigation.setOptions({ title: name });

    // Sets the initial system  and "Hello developer" message
    setMessages([
      {
        _id: 1,
        text: "Hello developer",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: "React Native",
          avatar: require("../assets/chat-bubble-image.png"),
        },
      },
      {
        _id: 2,
        text: "This is a system message",
        createdAt: new Date(),
        system: true,
      },
    ]);
  }, []);

  /**
   * Handler to append new messages to the messages array
   * @param newMessages The new messages to append to the messages array
   */
  const onSend = (newMessages) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
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
          _id: 1,
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
