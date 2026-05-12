import { auth } from '@/auth'
import HomeClient from './HomeClient'

export default async function Home() {
  const session = await auth()
  const email = session?.user?.email || null
  return <HomeClient userEmail={email} />
}
