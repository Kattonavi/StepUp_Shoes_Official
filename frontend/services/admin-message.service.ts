import apiClient from '@/lib/api'
import type {
  ApiResponse,
  CreateMessageRequest,
  Message,
  MessageDetail,
  MessageFilters,
  UnreadCountResponse,
  UpdateMessageNotesRequest,
} from '@/types'
import type { PageResponse } from '@/types'

export async function getMessages(filters: MessageFilters = {}): Promise<PageResponse<Message>> {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.source) params.set('source', filters.source)
  if (filters.search) params.set('search', filters.search)
  if (filters.productId) params.set('productId', filters.productId)
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  if (filters.includeDeleted) params.set('includeDeleted', 'true')
  params.set('page', String(filters.page ?? 0))
  params.set('size', String(filters.size ?? 20))

  const res = await apiClient.get<ApiResponse<PageResponse<Message>>>(`/messages?${params}`)
  return res.data.data!
}

export async function getMessage(id: string): Promise<MessageDetail> {
  const res = await apiClient.get<ApiResponse<MessageDetail>>(`/messages/${id}`)
  return res.data.data!
}

export async function createMessage(payload: CreateMessageRequest): Promise<MessageDetail> {
  const res = await apiClient.post<ApiResponse<MessageDetail>>('/messages', payload)
  return res.data.data!
}

export async function markMessageRead(id: string): Promise<MessageDetail> {
  const res = await apiClient.patch<ApiResponse<MessageDetail>>(`/messages/${id}/read`)
  return res.data.data!
}

export async function markMessageUnread(id: string): Promise<MessageDetail> {
  const res = await apiClient.patch<ApiResponse<MessageDetail>>(`/messages/${id}/unread`)
  return res.data.data!
}

export async function archiveMessage(id: string): Promise<MessageDetail> {
  const res = await apiClient.patch<ApiResponse<MessageDetail>>(`/messages/${id}/archive`)
  return res.data.data!
}

export async function updateMessageNotes(id: string, payload: UpdateMessageNotesRequest): Promise<MessageDetail> {
  const res = await apiClient.patch<ApiResponse<MessageDetail>>(`/messages/${id}/notes`, payload)
  return res.data.data!
}

export async function deleteMessage(id: string): Promise<void> {
  await apiClient.delete(`/messages/${id}`)
}

export async function restoreMessage(id: string): Promise<MessageDetail> {
  const res = await apiClient.post<ApiResponse<MessageDetail>>(`/messages/${id}/restore`)
  return res.data.data!
}

export async function getUnreadMessageCount(): Promise<UnreadCountResponse> {
  const res = await apiClient.get<ApiResponse<UnreadCountResponse>>('/messages/unread-count')
  return res.data.data!
}
