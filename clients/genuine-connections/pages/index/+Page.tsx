import { useEffect } from 'react'

export default function IndexPage() {
  useEffect(() => {
    window.location.href = '/admin'
  }, [])

  return null
}
