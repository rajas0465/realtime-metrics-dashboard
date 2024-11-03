import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";

const Header = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View
        style={styles.wrapper}
      >
        <View style={styles.userInfoWrapper}>
          <Image
            source={{ uri: "https://media.licdn.com/dms/image/v2/D5603AQE0RjULTLRv1Q/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1725342090888?e=1735776000&v=beta&t=lYtprltEZ9mF_MYzyvvgw9OnI9nV5J_g1y1fX-a4cIE" }}
            style={styles.userImg}
          />
          <View style={styles.userTxtWrapper}>
            {/* <Text style={[styles.userText, { fontSize: 12 }]}>Hi,</Text> */}
            <Text style={[styles.userText, { fontSize: 16 }]}>
               <Text style={styles.boldText}>Server Instance 1</Text>
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {}}
          style={styles.btnWrapper}
        >
          <Text style={styles.btnText}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.black, 
  },
  wrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 70,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  userInfoWrapper: { 
    flexDirection: "row", 
    alignItems: "center", 
  },
  userImg: { 
    height: 50, 
    width: 50, 
    borderRadius: 30, 
  },
  userTxtWrapper: {
    marginLeft:10,
  },
  userText: {
    color: Colors.white,
  },
  boldText: {
    fontWeight:'700',
  },
  btnWrapper: {
    borderColor: "#666",
    borderWidth: 1,
    padding: 8,
    borderRadius: 10,
  },
  btnText: { 
    color: Colors.white, 
    fontSize: 12,
  },
});
