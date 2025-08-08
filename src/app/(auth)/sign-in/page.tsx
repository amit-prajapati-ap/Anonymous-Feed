'use client'
import { useSession, signIn, signOut } from "next-auth/react"
const page = () => {
  const {data: session} = useSession()
  if (session) {
    return (
      <div>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    )
    
  }
  return (
    <div>
      Not signed in <br />
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer" onClick={() => signIn()}>Sign in</button>
    </div>
  )
}

export default page
