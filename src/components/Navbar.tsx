'use client'

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import {User} from 'next-auth'
import { Button } from "@react-email/components"

const Navbar = () => {
  const {data: session} = useSession()

  const user: User = session?.user as User
  return (
    <nav className="p-4 md:px-6 shadow-md">
      <div className="mx-auto container flex flex-col md:flex-row justify-between items-center">
        <Link className="text-xl font-bold mb-4 md:mb-0" href="/">Anonymous Feed</Link>
        {
          session ? (
            <>
              <span className="mr-4">Welcome, {user?.username || user?.email}</span>
              <Button className="w-full md:w-auto" onClick={() => signOut()}>Logout</Button>
            </>
          ) : (
            <Link href={'/sign-in'}><Button className="w-full md:w-auto">Login</Button></Link>
          )
        }
      </div>
    </nav>
  )
}

export default Navbar
