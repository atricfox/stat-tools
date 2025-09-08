import type { Metadata } from 'next'

type Params = { slug: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const title = `${slug.replace(/-/g, ' ')} | Statistical Tool`
  return { title }
}

export default async function ToolPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const title = slug.replace(/-/g, ' ')
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 capitalize">{title}</h1>
      <p className="mt-4 text-gray-700">
        This is a placeholder page for the <strong className="capitalize">{title}</strong> tool. Implementation coming soon.
      </p>
    </main>
  )
}

