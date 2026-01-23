import { ChatHistory } from '@/components/ChatHistory'
import { useColorScheme } from '@/components/useColorScheme'
import Colors from '@/constants/Colors'
import { useAuth } from '@/context/AuthContext'
import { useChatStore } from '@/store/chatStore'
import { FontAwesome5 } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInLeft, FadeInRight } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

// ... other imports

export default function Chat() {
  const [inputText, setInputText] = useState('')
  const [historyVisible, setHistoryVisible] = useState(false)

  const { user } = useAuth()
  const { messages, loading, fetchMessages, sendMessage, clearCurrentSession, fetchSessions } = useChatStore()
  const colorScheme = useColorScheme() ?? 'light'
  const currentColors = Colors[colorScheme as keyof typeof Colors]
  const flatListRef = useRef<FlatList<any>>(null)

  useEffect(() => {
    if (user) {
      fetchSessions(user.id)
    }
  }, [user])

  const handleSend = async (textToSend?: string) => {
    const content = textToSend || inputText.trim()
    if (!content || !user) return

    setInputText('')

    try {
      await sendMessage(user.id, content)
    } catch (e) {
      alert("Message failed to send. Please checking your internet or database connection.")
    }
  }

  const renderMessage = ({ item, index }: { item: any, index: number }) => {
    // ... existing renderMessage ...
    const isUser = item.role === 'user'
    const userInitials = user?.user_metadata?.username?.substring(0, 2).toUpperCase() || 'U'
    const cleanContent = item.content ? item.content.replace(/\*/g, '').trim() : ''

    return (
      <Animated.View
        entering={isUser ? FadeInRight : FadeInLeft}
        style={[
          styles.messageContainer,
          isUser ? styles.userContainer : styles.aiContainer
        ]}
      >
        {!isUser && (
          <View style={[styles.avatarSmall, { backgroundColor: currentColors.tint }]}>
            <FontAwesome5 name="robot" size={10} color="#fff" />
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isUser ? [styles.userBubble, { backgroundColor: currentColors.tint }] : [styles.aiBubble, { backgroundColor: currentColors.secondary }]
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? { color: '#fff' } : { color: currentColors.text }
          ]}>
            {cleanContent}
          </Text>
          <Text style={[
            styles.timestamp,
            isUser ? { color: 'rgba(255,255,255,0.6)' } : { color: currentColors.text + '60' }
          ]}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        {isUser && (
          <View style={[styles.avatarSmall, { backgroundColor: currentColors.accent, marginLeft: 8, marginRight: 0 }]}>
            <Text style={styles.avatarText}>{userInitials}</Text>
          </View>
        )}
      </Animated.View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <LinearGradient
        colors={[currentColors.tint + '10', 'transparent']}
        style={styles.gradientHeader}
      />

      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.headerTitle, { color: currentColors.text }]}>ILM AI</Text>
          <Text style={[styles.headerSubtitle, { color: currentColors.text + '80' }]}>Your Islamic Assistant</Text>
        </View>
        <TouchableOpacity onPress={() => setHistoryVisible(true)} style={styles.iconButton}>
          <FontAwesome5 name="history" size={18} color={currentColors.text} />
        </TouchableOpacity>
      </View>

      <ChatHistory
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={{ color: currentColors.text + '80' }}>Start a new conversation...</Text>
            </View>
          }
        />

        <View style={[styles.inputWrapper, { backgroundColor: currentColors.background }]}>
          <View style={[styles.inputContainer, { backgroundColor: currentColors.secondary }]}>
            <TextInput
              style={[styles.input, { color: currentColors.text }]}
              placeholder="Ask an Islamic question..."
              placeholderTextColor="#9BA3A1"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: currentColors.tint }]}
              onPress={() => handleSend()}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <FontAwesome5 name="paper-plane" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 10,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
  },
  iconButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
  },
  chatList: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  avatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  avatarText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  messageBubble: {
    padding: 14,
    borderRadius: 20,
    maxWidth: '80%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  inputWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderRadius: 25,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
