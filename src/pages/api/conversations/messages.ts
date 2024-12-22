import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { conversationId, role, content } = req.body
    
    try {
      const message = await prisma.message.create({
        data: {
          conversationId,
          role,
          content,
        },
      })
      return res.status(200).json(message)
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  }
  
  if (req.method === 'GET') {
    const { conversationId } = req.query
    
    try {
      const messages = await prisma.message.findMany({
        where: {
          conversationId: Number(conversationId),
        },
        orderBy: {
          createdAt: 'asc',
        },
      })
      return res.status(200).json(messages)
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  }
  
  return res.status(405).json({ message: 'Method not allowed' })
}