'use client'
import * as z from 'zod'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useDebounceCallback } from 'usehooks-ts'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import { signUpSchema } from '@/schemas/signUpSchema'
import axios, {AxiosError} from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {Loader2} from 'lucide-react'

const Page = () => {
  const [usernameMessage, setUsernameMessage] = useState('')
  const [username, setUsername] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const debounced = useDebounceCallback(setUsername, 500)
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
      if (username) {
        setIsCheckingUsername(true)
        setUsernameMessage("")
      }
      try {
        const response = await axios.get<ApiResponse>(`/api/check-username-unique?username=${username}`)

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
  }, [username])

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
      <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md'>
        <div className='text-center'>
          <h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl mb-6'>Join Anonymous Feed</h1>
          <p className='mb-4'>Sign up to start your anonymous adventure</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField control={form.control} name='username' render={({field}) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input required placeholder='username' {...field} onChange={e => {
                    field.onChange(e)
                    debounced(e.target.value)
                  }}/>
                </FormControl>
                {isCheckingUsername && <Loader2 className='animate-spin'/>}
                <p className={`text-sm ${usernameMessage === 'username is available' ? 'text-green-500' : 'text-red-500'}`}>
                  {username} {usernameMessage}
                </p>
                <FormMessage/>
              </FormItem>
            )}/>
            <FormField control={form.control} name='email' render={({field}) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input required placeholder='email' {...field} />
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}/>
            <FormField control={form.control} name='password' render={({field}) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input required type='password' placeholder='password' {...field} />
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}/>
            <Button type='submit' disabled={isCheckingUsername || isSubmitting} className={`cursor-pointer ${isCheckingUsername || isSubmitting ? 'cursor-not-allowed' : ''}`}>
              {
                isSubmitting ? <><Loader2 className='mr-2 h-4 w-4 animate-spin'/> Signing up...</> : "Sign up"
              }</Button>
          </form>
        </Form>

        <div className='text-center mt-4'>
          <p>
            Already a member?{" "}
            <Link href={'/sign-in'} className='text-blue-600 hover:text-blue-800'>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Page
