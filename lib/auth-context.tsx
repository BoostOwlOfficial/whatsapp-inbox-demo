"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
    username: string
    name: string
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    login: (username: string, password: string) => boolean
    logout: () => void
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check if user is already logged in
        const savedUser = localStorage.getItem("whatsapp_user")
        if (savedUser) {
            setUser(JSON.parse(savedUser))
        }
        setIsLoading(false)
    }, [])

    const login = (username: string, password: string): boolean => {
        // Login credentials
        if (username === "tmayank85" && password === "tmayank85") {
            const newUser = {
                username: "tmayank85",
                name: "Mayank Tyagi",
            }
            setUser(newUser)
            localStorage.setItem("whatsapp_user", JSON.stringify(newUser))
            return true
        }
        return false
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("whatsapp_user")
        router.push("/login")
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                login,
                logout,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
