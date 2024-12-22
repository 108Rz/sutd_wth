// pages/api/test-db.ts
export interface GeminiMessage {
    role: 'user' | 'model' | 'system'
    content: string
}