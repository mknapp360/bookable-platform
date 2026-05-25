import { Turnstile } from '@marsidev/react-turnstile'

const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

export function TurnstileWidget({ onToken }: { onToken: (token: string | undefined) => void }) {
  if (!siteKey) return null
  return (
    <Turnstile
      siteKey={siteKey}
      onSuccess={(token: string) => onToken(token)}
      onExpire={() => onToken(undefined)}
    />
  )
}
