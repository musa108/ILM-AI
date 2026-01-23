import { useColorScheme } from '@/components/useColorScheme'
import Colors from '@/constants/Colors'
import { useChatStore } from '@/store/chatStore'
import { FontAwesome5 } from '@expo/vector-icons'
import React from 'react'
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type ChatHistoryProps = {
    visible: boolean
    onClose: () => void
}

export function ChatHistory({ visible, onClose }: ChatHistoryProps) {
    const { sessions, currentSessionId, selectSession, deleteSession, clearCurrentSession } = useChatStore()
    const colorScheme = useColorScheme() ?? 'light'
    const currentColors = Colors[colorScheme]

    const handleSelect = async (id: string) => {
        await selectSession(id)
        onClose()
    }

    const handleDelete = async (id: string) => {
        await deleteSession(id)
    }

    const handleNewChat = () => {
        clearCurrentSession()
        onClose()
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: currentColors.text }]}>Chat History</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <FontAwesome5 name="times" size={20} color={currentColors.text} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.newChatButton, { backgroundColor: currentColors.tint }]}
                    onPress={handleNewChat}
                >
                    <FontAwesome5 name="plus" size={16} color="#fff" />
                    <Text style={styles.newChatText}>New Chat</Text>
                </TouchableOpacity>

                <FlatList
                    data={sessions}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <View style={[
                            styles.sessionItem,
                            {
                                backgroundColor: currentColors.secondary,
                                borderColor: currentSessionId === item.id ? currentColors.tint : 'transparent',
                                borderWidth: 1
                            }
                        ]}>
                            <TouchableOpacity
                                style={styles.sessionContent}
                                onPress={() => handleSelect(item.id)}
                            >
                                <Text style={[styles.sessionTitle, { color: currentColors.text }]} numberOfLines={1}>
                                    {item.title || 'Untitled Chat'}
                                </Text>
                                <Text style={[styles.sessionDate, { color: currentColors.text + '80' }]}>
                                    {new Date(item.created_at).toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDelete(item.id)}
                            >
                                <FontAwesome5 name="trash" size={14} color="#FF6B6B" />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </SafeAreaView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
    newChatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 20,
        padding: 15,
        borderRadius: 12,
        gap: 10,
    },
    newChatText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    list: {
        paddingHorizontal: 20,
    },
    sessionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    sessionContent: {
        flex: 1,
    },
    sessionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    sessionDate: {
        fontSize: 12,
    },
    deleteButton: {
        padding: 10,
    },
})
