import React from "react";
import { Tabs } from "expo-router";
import { AntDesign, FontAwesome, SimpleLineIcons } from "@expo/vector-icons";
import { View } from "react-native";
import Colors from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";

const Layout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: Colors.grey,
            position: "absolute",
            bottom: 40,
            justifyContent: "center",
            alignSelf: "center",
            height: 63,
            marginHorizontal: 120,
            paddingHorizontal: 10,
            paddingVertical: 8,
            paddingBottom: 8,
            borderRadius: 40,
            borderWidth: 1,
            borderTopWidth: 1,
            borderColor: "#333",
            borderTopColor: "#333",
          },
          tabBarShowLabel: false,
          tabBarInactiveTintColor: "#999",
          tabBarActiveTintColor: Colors.white,
        }}
      >

        <Tabs.Screen
          name="webserver1"
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <View
                style={{
                  padding: 12,
                  borderRadius: 30,
                  backgroundColor: focused ? Colors.tintColor : Colors.grey,
                }}
              >
                <FontAwesome name="server" size={18} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="webserver2"
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <View
                style={{
                  padding: 12,
                  borderRadius: 30,
                  backgroundColor: focused ? Colors.tintColor : Colors.grey,
                }}
              >
                <FontAwesome name="server" size={18} color={color} />
              </View>
            ),
          }}
        />
       <Tabs.Screen
          name="dbserver"
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <View
                style={{
                  padding: 12,
                  borderRadius: 30,
                  backgroundColor: focused ? Colors.tintColor : Colors.grey,
                }}
              >
                <FontAwesome name="database" size={18} color={color} />
              </View>
            ),
          }}
        />
      </Tabs>
      <StatusBar style="light" />
    </>
  );
};

export default Layout;
