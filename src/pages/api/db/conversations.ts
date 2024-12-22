// pages/api/db/conversation.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/server/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      console.log('Creating new conversation...')
      const conversation = await prisma.conversation.create({
        data: {}
      })
      console.log('Created conversation:', conversation)
      return res.status(200).json(conversation)
    } catch (error: any) {
      console.error('Server error creating conversation:', error)
      return res.status(500).json({ 
        error: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      })
    }
  }
  return res.status(405).json({ message: 'Method not allowed' })
}