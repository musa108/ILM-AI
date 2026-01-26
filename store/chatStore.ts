import { getAIResponse, SYSTEM_PROMPT } from '@/lib/ai'
import { supabase } from '@/lib/supabase'
import { create } from 'zustand'

type Message = {
    id: string
    role: 'user' | 'assistant'
    content: string
    created_at: string
    session_id?: string
}

type Session = {
    id: string
    title: string
    created_at: string
}

type ChatState = {
    messages: Message[]
    sessions: Session[]
    currentSessionId: string | null
    loading: boolean

    // Actions
    fetchSessions: (userId: string) => Promise<void>
    createSession: (userId: string, title?: string) => Promise<string>
    selectSession: (sessionId: string) => Promise<void>
    deleteSession: (sessionId: string) => Promise<void>

    fetchMessages: (sessionId: string) => Promise<void>
    sendMessage: (userId: string, content: string) => Promise<void>
    clearCurrentSession: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],
    sessions: [],
    currentSessionId: null,
    loading: false,

    fetchSessions: async (userId: string) => {
        const { data, error } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (!error) {
            set({ sessions: data || [] })
        }
    },

    createSession: async (userId: string, title: string = 'New Chat') => {
        const { data, error } = await supabase
            .from('chat_sessions')
            .insert({ user_id: userId, title })
            .select()
            .single()

        if (!error && data) {
            set((state) => ({
                sessions: [data, ...state.sessions],
                currentSessionId: data.id,
                messages: []
            }))
            return data.id
        }
        return ''
    },

    selectSession: async (sessionId: string) => {
        set({ currentSessionId: sessionId, loading: true })
        await get().fetchMessages(sessionId)
        set({ loading: false })
    },

    deleteSession: async (sessionId: string) => {
        const { error } = await supabase
            .from('chat_sessions')
            .delete()
            .eq('id', sessionId)

        if (!error) {
            set((state) => ({
                sessions: state.sessions.filter(s => s.id !== sessionId),
                messages: state.currentSessionId === sessionId ? [] : state.messages,
                currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId
            }))
        }
    },

    fetchMessages: async (sessionId: string) => {
        set({ loading: true })
        const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true })

        if (!error) {
            set({ messages: data || [] })
        }
        set({ loading: false })
    },

    sendMessage: async (userId: string, content: string) => {
        let sessionId = get().currentSessionId

        // Auto-create session if none exists
        if (!sessionId) {
            // Generate title from first few words
            const title = content.split(' ').slice(0, 4).join(' ') + '...'
            sessionId = await get().createSession(userId, title)
            if (!sessionId) return // Failed to create
        }

        const userMessage: Message = {
            id: Math.random().toString(),
            role: 'user',
            content,
            created_at: new Date().toISOString(),
            session_id: sessionId
        }

        set((state) => ({ messages: [...state.messages, userMessage], loading: true }))

        await supabase.from('conversations').insert({
            user_id: userId,
            session_id: sessionId,
            role: 'user',
            content,
        })

        try {
            const history = [
                { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
                { role: 'model', parts: [{ text: 'Understood.' }] },
                ...get().messages.map(m => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.content }]
                }))
            ]

            const aiResponse = await getAIResponse(content, history)

            const assistantMessage: Message = {
                id: Math.random().toString(),
                role: 'assistant',
                content: aiResponse,
                created_at: new Date().toISOString(),
                session_id: sessionId
            }

            set((state) => ({ messages: [...state.messages, assistantMessage] }))

            await supabase.from('conversations').insert({
                user_id: userId,
                session_id: sessionId,
                role: 'assistant',
                content: aiResponse,
            })
        } catch (error) {
            console.error('Error sending message:', error)
        } finally {
            set({ loading: false })
        }
    },

    clearCurrentSession: () => {
        set({ currentSessionId: null, messages: [] })
    }
}))
