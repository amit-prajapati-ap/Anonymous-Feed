'use client'
import * as z from 'zod'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {Loader2} from 'lucide-react'
import { signInSchema } from '@/schemas/signInSchema'
import { signIn } from 'next-auth/react'

const page = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  //zod implementation
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true)
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      })

      console.log(result)

      if (result?.error) {
        toast.error("Incorrect email or password")
      } 
      
      if (result?.url) {
        router.replace('/dashboard')
      }
    } catch (error) {
     console.log('Error in signin :: ', error)
     toast.error('Error in signin')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
      <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md'>
        <div className='text-center'>
          <h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl mb-6'>Welcome Back</h1>
          <p className='mb-4'>Sign in to check your anonymous messages</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
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
            <Button type='submit' disabled={isSubmitting} className={`${isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              {
                isSubmitting ? <><Loader2 className='mr-2 h-4 w-4 animate-spin'/> Signing...</> : "Sign in"
              }</Button>
          </form>
        </Form>

        <div className='text-center mt-4'>
          <p>
            Create new account?{" "}
            <Link href={'/sign-up'} className='text-blue-600 hover:text-blue-800'>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default page
