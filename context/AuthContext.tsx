import { Session, User } from '@supabase/supabase-js'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type AuthContextType = {
    session: Session | null
    user: User | null
    loading: boolean
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let authListener: any = null;

        const initAuth = async () => {
            try {
                const { data } = await supabase.auth.getSession();
                const session = data?.session ?? null;
                setSession(session);
                setUser(session?.user ?? null);
            } catch (e) {
                console.error("Auth session error:", e);
            } finally {
                setLoading(false);
            }

            try {
                const { data } = supabase.auth.onAuthStateChange((_event, session) => {
                    setSession(session);
                    setUser(session?.user ?? null);
                    setLoading(false);
                });
                authListener = data?.subscription;
            } catch (e) {
                console.error("Auth listener error:", e);
            }
        };

        initAuth();

        return () => {
            if (authListener) authListener.unsubscribe();
        }
    }, [])

    return (
        <AuthContext.Provider value={{ session, user, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
