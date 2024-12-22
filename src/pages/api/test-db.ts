// pages/api/test-db.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Test creating a conversation
    const conversation = await prisma.conversation.create({
      data: {}
    })

    // Test creating a message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'system',
        content: 'Test message'
      }
    })

    return res.status(200).json({ 
      success: true, 
      conversation,
      message
    })
  } catch (error: any) {
    console.error('Database error:', error)
    return res.status(500).json({ 
      message: 'Database error',
      error: error.message,
      stack: error.stack
    })
  }
}