'use client'

import { Button } from "@/components/ui/button"
import { ApiResponse } from "@/types/ApiResponse"
import axios, { AxiosError } from "axios"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { suggestedMessagesDemo } from "../../../assets/suggestedMessages"

const Page = () => {
  const params = useParams<{ username: string }>()
  const username = params.username
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([])
  const [isSuggestingMessages, setIsSuggestingMessages] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [messageContent, setMessageContent] = useState('')

  const suggestMessages = async () => {
    setIsSuggestingMessages(true)
    try {
      const response = await axios.post<ApiResponse>(`/api/suggest-messages`)
      if (response.data.success) {
        setSuggestedMessages((response.data.text || '').split('||'))
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      // const axiosError = error as AxiosError<ApiResponse>
      // toast.error(axiosError.response?.data.message ?? "Failed to fetch suggested messages")
      console.log(error)
    } finally {
      setIsSuggestingMessages(false)
    }
  }

  const sendAnonymousMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSendingMessage(true)
    try {
      const response = await axios.post('/api/send-message', { username, content: messageContent })

      console.log(response)

      if (response.data.success) {
        toast.success(response.data.message)
        setMessageContent('')
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message ?? "Failed to send message")
    } finally {
      setIsSendingMessage(false)
    }
  }

  useEffect(() => {
    suggestMessages()
  }, [])

  return (
    <div className='flex max-w-7xl mx-auto flex-col items-center min-h-screen'>
      <div className='w-full max-w-md p-8 space-y-8 rounded-lg'>
        <h1 className='text-4xl text-center font-extrabold tracking-tight lg:text-5xl mb-6'>Public Profile Link</h1>
      </div>
      <div className="w-full flex flex-col gap-3 px-8">
        <h2 className="text-lg font-bold">Send Anonymous Message to @{username}</h2>
        <form onSubmit={sendAnonymousMessage} className="flex flex-col gap-3">
          <textarea rows={2} required className="border resize-none rounded-md p-2" placeholder="Type your message here" onChange={(e) => setMessageContent(e.target.value)} value={messageContent} />
          <Button type="submit" className={`w-24 mx-auto ${isSendingMessage ? "cursor-not-allowed" : "cursor-pointer"}`}>{isSendingMessage ? "Sending..." : "Send it"}</Button>
        </form>
      </div>

      <div className="w-full flex flex-col gap-3 px-8 pt-8">
        <Button onClick={suggestMessages} className={`w-38 py-3 ${isSuggestingMessages ? "cursor-not-allowed" : "cursor-pointer"}`}>{isSuggestingMessages ? "Suggesting..." : "Suggest messages"}</Button>
        <h2 className="text-lg font-semibold">Click on any message below to select  it.</h2>
        <div className="flex flex-col gap-3 py-10 px-6 border shadow-md">
          <h1 className="text-2xl mb-3 font-bold">Suggested Messages</h1>
          <div className="flex flex-col gap-8">
            {
              suggestedMessages.map((message: string, index: number) => (
                <p onClick={() => setMessageContent(message)} className="cursor-pointer hover:bg-gray-50 transition-all duration-300 py-3 border shadow-md text-center w-full font-semibold text-lg" key={index}>{message}</p>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
