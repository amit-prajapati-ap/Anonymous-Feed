'use client'
import * as z from 'zod'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useDebounceValue } from 'usehooks-ts'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import { signUpSchema } from '@/schemas/signUpSchema'
import axios, {AxiosError} from 'axios'
import { ApiResponse } from '@/types/ApiResponse'

const page = () => {
  const [usernameMessage, setUsernameMessage] = useState('')
  const [username, setUsername] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const debounceUsername = useDebounceValue(username, 300)
  const router = useRouter()

  //zod implementation
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      username: ""
    }
  })

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true)
    try {
      console.log(data)
      const response = await axios.post<ApiResponse>('/api/sign-up', data)

      if (response.data.success) {
        toast.success(response.data.message)
        router.replace(`/verify/${username}`)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
     console.log('Error in signup :: ', error)
     const axiosError = error as AxiosError<ApiResponse>
     toast.error(axiosError.response?.data.message ?? "Error in signup")
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (debounceUsername) {
        setIsCheckingUsername(true)
        setUsernameMessage("")
      }
      try {
        const response = await axios.get<ApiResponse>(`/api/check-username-unique?username=${debounceUsername}`)

        console.log(response)
        setUsernameMessage(response.data.message)
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        setUsernameMessage(axiosError.response?.data.message ?? "Error checking username")
      } finally {
        setIsCheckingUsername(false)
      }
    }

    checkUsernameUnique()
  }, [debounceUsername])

  return (
    <div>
      
    </div>
  )
}

export default page
