import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Send, Phone, MoreVertical } from "lucide-react-native";
import colors from "@/constants/colors";

interface Message {
  id: string;
  text: string;
  sender: "user" | "driver";
  timestamp: string;
  type: "text" | "system";
}

export default function ChatScreen() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Order has been assigned to Peter Mwangi",
      sender: "driver",
      timestamp: "2:05 PM",
      type: "system",
    },
    {
      id: "2",
      text: "Hello! I am on my way to pick up your package from Westlands Mall.",
      sender: "driver",
      timestamp: "2:06 PM",
      type: "text",
    },
    {
      id: "3",
      text: "Great! How long will it take?",
      sender: "user",
      timestamp: "2:07 PM",
      type: "text",
    },
    {
      id: "4",
      text: "I should be there in about 10 minutes. Traffic is light.",
      sender: "driver",
      timestamp: "2:08 PM",
      type: "text",
    },
    {
      id: "5",
      text: "Package picked up successfully",
      sender: "driver",
      timestamp: "2:20 PM",
      type: "system",
    },
    {
      id: "6",
      text: "Package picked up! Now heading to Karen Shopping Centre.",
      sender: "driver",
      timestamp: "2:21 PM",
      type: "text",
    },
  ]);

  const driverInfo = {
    name: "Peter Mwangi",
    phone: "+254712345678",
  };

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "text",
      };
      setMessages(prev => [...prev, newMessage]);
      setMessage("");
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.type === "system") {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{item.text || ''}</Text>
          <Text style={styles.systemMessageTime}>{item.timestamp}</Text>
        </View>
      );
    }

    const isUser = item.sender === "user";
    
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.driverMessage]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.driverBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.driverMessageText]}>
            {item.text || ''}
          </Text>
        </View>
        <Text style={[styles.messageTime, isUser ? styles.userMessageTime : styles.driverMessageTime]}>
          {item.timestamp}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.driverInfo}>
          <View style={styles.driverAvatar}>
            <Text style={styles.driverInitial}>{driverInfo.name.charAt(0)}</Text>
          </View>
          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>{driverInfo.name}</Text>
            <Text style={styles.driverStatus}>Online</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              // TODO: Implement phone call
              console.log("Call driver:", driverInfo.phone);
            }}
          >
            <Phone size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <MoreVertical size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity
            style={[styles.sendButton, message.trim() ? styles.sendButtonActive : null]}
            onPress={sendMessage}
            disabled={!message.trim()}
          >
            <Send
              size={20}
              color={message.trim() ? colors.background : colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.background,
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  driverInitial: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.background,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  driverStatus: {
    fontSize: 12,
    color: colors.success,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    flexGrow: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  driverMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  driverBubble: {
    backgroundColor: colors.backgroundSecondary,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: colors.background,
  },
  driverMessageText: {
    color: colors.text,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  userMessageTime: {
    color: colors.textMuted,
    textAlign: "right",
  },
  driverMessageTime: {
    color: colors.textMuted,
    textAlign: "left",
  },
  systemMessage: {
    alignItems: "center",
    marginBottom: 16,
  },
  systemMessageText: {
    fontSize: 12,
    color: colors.textMuted,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    textAlign: "center",
  },
  systemMessageTime: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.background,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
  },
});