import AsyncStorage from "@react-native-async-storage/async-storage";
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
  InputToolbar
} from "react-native-gifted-chat";
import CustomActions from "./CustomActions";
import MapView from "react-native-maps";

const Chat = ({ db, storage, route, navigation, isConnected }) => {
  // Get the user params
  const { userID, backgroundColor, name } = route.params;
  const [messages, setMessages] = useState([]);
  let unsubMessages;

  useEffect(() => {
    // Sets the username as navigation bar title
    navigation.setOptions({ title: name });

    if (isConnected === true) {
      // unregister current onSnapshot() listener to avoid registering multiple listeners when
      // useEffect code is re-executed.
      if (unsubMessages) unsubMessages();
      unsubMessages = null;

      // Query that sorts the messages in descending order for the Snapshot
      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));

      // Snapshot that targets the messages db through the defined query
      unsubMessages = onSnapshot(q, (documentsSnapshot) => {
        let newMessages = [];
        documentsSnapshot.forEach((doc) => {
          newMessages.push({
            id: doc.id,
            location: doc.data().location || null,
            ...doc.data(),
            createdAt: new Date(doc.data().createdAt.toMillis()),
          });
        });
        cacheMessages(newMessages);
        setMessages(newMessages);
      });
    } else loadCachedMessages();
    return () => {
      if (unsubMessages) unsubMessages();
    };
  }, [isConnected]);

  /**
   * Handler to cache messages to the device
   * @param messagesToCache The messages array to set to the cache
   */
  const cacheMessages = async (messagesToCache) => {
    try {
      await AsyncStorage.setItem(
        "messages_list",
        JSON.stringify(messagesToCache)
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  /**
   * Handler to load cached messages when there is no internet connection
   */
  const loadCachedMessages = async () => {
    const cachedMessages = (await AsyncStorage.getItem("messages_list")) || [];
    setMessages(JSON.parse(cachedMessages));
  };

  /**
   * Handler to render the InputToolbar
   * @param props The default props of InputToolbar
   * @returns InputToolbar if internet connection is available, otherwise null
   */
  const renderInputToolbar = (props) => {
    if (isConnected) return <InputToolbar {...props} />;
    else return null;
  };

  /**
   * Handler to append new messages to the messages array
   * @param newMessages The new messages to append to the messages array
   */
  const onSend = (newMessages) => {
    addDoc(collection(db, "messages"), newMessages[0]);
  };

  /**
   * Handler to customize the chat bubbles
   * @param props The default props of <Bubble>
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

  /**
   * Handler to customize the actions for the plus button
   * @param props The default props of for renderActions
   * @returns <CustomActions> component for choosing and taking
   * images and sending the users location
   */
  const renderCustomActions = (props) => {
    return (
      <CustomActions
        onSend={onSend}
        storage={storage}
        userID={userID}
        userName={name}
        {...props}
      />
    );
  };

  /**
   * Helper to display the location of a user
   * @param props The default props for renderCustomView
   * @returns <MapView> for showing the user's location
   */
  const renderCustomView = (props) => {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
      <GiftedChat
        messages={messages}
        renderBubble={renderBubble}
        renderSystemMessage={renderSystemMessage}
        renderDay={renderDay}
        renderInputToolbar={renderInputToolbar}
        renderActions={renderCustomActions}
        renderCustomView={renderCustomView}
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
