import { useActionSheet } from "@expo/react-native-action-sheet";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CustomActions = ({
  wrapperStyle,
  iconTextStyle,
  onSend,
  userID,
  userName,
  storage,
}) => {
  const actionSheet = useActionSheet();

  /**
   * Generates a reference of an image to store
   * @param uri The image uri
   * @returns An image reference as a string
   */
  const generateReference = (uri) => {
    const timeStamp = new Date().getTime();
    const imageName = uri.split("/")[uri.split("/").length - 1];
    return `${userID}-${timeStamp}-${imageName}`;
  };

  /**
   * Helper to upload and send an image
   * @param imageURI The image uri of an image to send
   */
  const uploadAndSendImage = async (imageURI) => {
    const uniqueRefString = generateReference(imageURI);
    const newUploadRef = ref(storage, uniqueRefString);
    const response = await fetch(imageURI);
    const blob = await response.blob();
    uploadBytes(newUploadRef, blob).then(async (snapshot) => {
      const imageURL = await getDownloadURL(snapshot.ref);
      onSend([
        {
          _id: Math.round(Math.random() * 1000000),
          createdAt: new Date(),
          user: {
            _id: userID,
            name: userName,
          },
          image: imageURL,
        },
      ]);
    });
  };

  /**
   * Pick an image from the media library and send it to firestore
   * */
  const pickImage = async () => {
    let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissions?.granted) {
      let result = await ImagePicker.launchImageLibraryAsync();
      if (!result.canceled) await uploadAndSendImage(result.assets[0].uri);
      else Alert.alert("Permissions haven't been granted.");
    }
  };

  const takePhoto = async () => {
    let permissions = await ImagePicker.requestCameraPermissionsAsync();

    if (permissions?.granted) {
      let result = await ImagePicker.launchCameraAsync();
      if (!result.canceled) await uploadAndSendImage(result.assets[0].uri);
      else Alert.alert("Permissions haven't been granted");
    }
  };

  /**
   * Get the user's current location and send it
   */
  const getLocation = async () => {
    let permissions = await Location.requestForegroundPermissionsAsync();
    if (permissions.granted) {
      const location = await Location.getCurrentPositionAsync({});
      if (location) {
        onSend([
          {
            _id: Math.round(Math.random() * 1000000),
            createdAt: new Date(),
            user: {
              _id: userID,
              name: userName,
            },
            location: {
              longitude: location.coords.longitude,
              latitude: location.coords.latitude,
            },
          },
        ]);
      } else {
        Alert.alert("Error occurred while fetching location");
      }
    } else {
      Alert.alert("Permissions haven't been granted.");
    }
  };

  /**
   * Handler for the press on the plus button within the gifted chat input
   */
  const onActionPress = () => {
    const options = [
      "Choose From Library",
      "Take Picture",
      "Send Location",
      "Cancel",
    ];
    const cancelButtonIndex = options.length - 1;
    actionSheet.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            pickImage();
            return;
          case 1:
            takePhoto();
            return;
          case 2:
            getLocation();
          default:
        }
      }
    );
  };

  return (
    <TouchableOpacity accessible style={styles.container} onPress={onActionPress}>
      <View style={[styles.wrapper, wrapperStyle]}>
        <Text accessibilityLabel="More options" style={[styles.iconText, iconTextStyle]}>+</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: "#b2b2b2",
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: "#b2b2b2",
    fontWeight: "bold",
    fontSize: 16,
    backgroundColor: "transparent",
    textAlign: "center",
  },
});

export default CustomActions;
