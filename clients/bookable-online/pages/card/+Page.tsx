// Route moved to /qrcard
import { useEffect } from 'react'

export default function CardRedirect() {
  useEffect(() => { window.location.replace('/qrcard') }, [])
  return null
}
