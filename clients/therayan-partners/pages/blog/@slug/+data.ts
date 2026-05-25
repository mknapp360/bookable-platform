import { createClient } from '@supabase/supabase-js'
import { render } from 'vike/abort'

export type Post = {
  id: string
  title: string
  slug: string
  content: string | null
  excerpt: string | null
  published_at: string | null
  status: 'draft' | 'published'
}

export type Data = {
  post: Post
}

export async function data(pageContext: { routeParams: { slug: string } }): Promise<Data> {
  const { slug } = pageContext.routeParams

  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL as string,
    import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  )

  const { data: post, error } = await supabase
    .from('posts')
    .select('id, title, slug, content, excerpt, published_at, status')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !post) {
    throw render(404, `Post "${slug}" not found`)
  }

  return { post }
}
