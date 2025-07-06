import { useHeo2Global } from '@/themes/heo2'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const SearchResults = () => {
  const { filteredNavPages, allNavPages } = useHeo2Global()
  const router = useRouter()
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    // 只在首页显示搜索结果
    if (router.route === '/') {
      setShowResults(true)
    } else {
      setShowResults(false)
    }
  }, [router.route])

  // 如果没有搜索结果或者结果数量等于总数量，则不显示
  if (!showResults || !filteredNavPages || filteredNavPages.length === 0 || filteredNavPages.length === allNavPages?.length) {
    return null
  }

  return (
    <div className='w-full max-w-4xl mx-auto px-4 py-8'>
      <div className='bg-white dark:bg-[#18171d] rounded-2xl shadow-lg p-6 border dark:border-gray-600'>
        <h2 className='text-xl font-bold mb-4 text-gray-800 dark:text-gray-200'>
          搜索结果 ({filteredNavPages.length})
        </h2>
        <div className='space-y-4'>
          {filteredNavPages.map((post, index) => (
            <div
              key={index}
              className='border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors'>
              <Link href={`/${post.slug}`}>
                <div className='group cursor-pointer'>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                    {post.title}
                  </h3>
                  {post.summary && (
                    <p className='text-gray-600 dark:text-gray-400 mt-2 line-clamp-2'>
                      {post.summary}
                    </p>
                  )}
                  <div className='flex items-center mt-2 text-sm text-gray-500 dark:text-gray-500'>
                    {post.date && (
                      <span className='mr-4'>
                        <i className='fas fa-calendar mr-1' />
                        {post.date}
                      </span>
                    )}
                    {post.category && (
                      <span className='mr-4'>
                        <i className='fas fa-folder mr-1' />
                        {post.category}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SearchResults 