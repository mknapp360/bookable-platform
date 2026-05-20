import { createClient } from '@supabase/supabase-js'

export type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  published_at: string | null
  status: 'draft' | 'published'
}

export type Data = {
  posts: Post[]
}

export async function data(): Promise<Data> {
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL as string,
    import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  )

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, published_at, status')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch posts:', error.message)
    return { posts: [] }
  }

  return { posts: posts ?? [] }
}
