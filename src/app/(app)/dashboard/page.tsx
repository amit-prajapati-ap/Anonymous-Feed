'use client'

import MessageCard from "@/components/MessageCard"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Message } from "@/model/User.model"
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema"
import { ApiResponse } from "@/types/ApiResponse"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from "axios"
import { Loader2, RefreshCcw } from "lucide-react"
import { User } from "next-auth"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

const page = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitchLoading, setIsSwitchLoading] = useState(false)

  const handleDeleteMessage = async (messageId: string) => {
    setMessages(messages.filter(message => message._id !== messageId))
  }

  const { data: session } = useSession()

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema)
  })

  const { register, watch, setValue } = form

  const acceptMessages = watch('acceptMessages')

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages')
      setValue('acceptMessages', response.data.isAcceptingMessages as boolean)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      console.log(axiosError.response?.data.message)
      toast.error(axiosError.response?.data.message ?? "Failed to fetch message settings")
    } finally {
      setIsSwitchLoading(false)
    }
  }, [setValue])

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true)
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>('/api/get-messages')

      setMessages(response.data.messages || [])

      if (refresh) {
        toast.success('Messages refreshed')
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      console.log(axiosError.response?.data.message)
      toast.error(axiosError.response?.data.message ?? "Failed to fetch messages")
    } finally {
      setIsLoading(false)
      setIsSwitchLoading(false)
    }
  }, [setIsLoading, setMessages])

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>("/api/accept-messages", { acceptMessages: !acceptMessages })

      if (response.data.success) {
        setValue('acceptMessages', response.data.isAcceptingMessages as boolean)

        toast.success(response.data.message)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      console.log(axiosError.response?.data.message)
      toast.error(axiosError.response?.data.message ?? "Failed to update message settings")
    }
  }

  const user: User = session?.user as User
  console.log(session)
  const baseUrl = `${window.location.protocol}//${window.location.host}`
  const profileUrl = `${baseUrl}/me/${user?.username || ''}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl)
    toast.success('Copied to clipboard')
  }

  useEffect(() => {
    if (!session || !session.user) return

    console.log(session)

    fetchMessages()
    fetchAcceptMessages()
  }, [session, setValue, fetchAcceptMessages, fetchMessages])

  if(!session) {
    return <div className="flex items-center justify-center h-screen">
      <Loader2 className="animate-spin w-8 h-8" />
    </div>
  }

  if (!session.user) {
    return <div className="flex items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">You are not logged in</h1>
    </div>
    
  }

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl from-bold mb-4">User Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Profile URL</h2>
        <div className="flex items-center">
          <input type="text" value={profileUrl} readOnly className="border w-full p-2 mr-2" />
          <button onClick={copyToClipboard} className="cursor-pointer">Copy</button>
        </div>
      </div>

      <div className="mb-4 cursor-pointer">
        <Switch {...register("acceptMessages")} checked={acceptMessages} onCheckedChange={handleSwitchChange} disabled={isSwitchLoading} className="cursor-pointer"/>

        <span className="ml-2 cursor-default">Accept Messages: {acceptMessages ? (<span className='text-green-500'>Enabled</span>) : (<span className='text-red-500'>Disabled</span>)}</span>
      </div>

      <Separator/>

      <Button className="mt-4" variant={'outline'} onClick={e => {
        e.preventDefault()
        fetchMessages(true)
      }}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin"/>
        ) : (
          <RefreshCcw className="h-4 w-4"/>
        )}
      </Button>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard key={index} message={message} onMessageDelete={handleDeleteMessage}/>
          ))
        ) : (
          <p className="text-gray-500">No messages found.</p>
        )}
      </div>
    </div>
  )
}

export default page
