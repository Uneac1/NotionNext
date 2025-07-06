import { useState } from 'react'

/**
 * 内容搜索组件
 * 纯客户端版本，不依赖API，避免编译错误
 */
const useContentSearch = () => {
  const [isSearching, setIsSearching] = useState(false)

  // 高亮匹配文本的函数
  const highlightText = (text, keyword) => {
    if (!keyword || !text) return text
    
    try {
      const regex = new RegExp(`(${keyword})`, 'gi')
      return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
    } catch (error) {
      console.warn('Highlight text error:', error)
      return text
    }
  }

  // 安全地获取标签名称
  const getTagNames = (tags) => {
    if (!tags) return ''
    if (Array.isArray(tags)) {
      return tags.map(tag => tag?.name || '').filter(Boolean).join(' ')
    }
    if (typeof tags === 'string') {
      return tags
    }
    return ''
  }

  // 客户端本地搜索功能
  const searchContent = async (keyword, posts) => {
    if (!keyword || !posts || !Array.isArray(posts) || posts.length === 0) {
      return []
    }

    setIsSearching(true)
    
    try {
      // 模拟异步搜索
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const results = []
      
      for (const post of posts) {
        if (!post || typeof post !== 'object') continue
        
        // 搜索标题、摘要、标签和分类
        const searchText = [
          post.title || '',
          post.summary || '',
          getTagNames(post.tags),
          post.category || ''
        ].join(' ').toLowerCase()
        
        if (searchText.includes(keyword.toLowerCase())) {
          // 找到匹配的文本片段
          let snippet = ''
          if (post.title && typeof post.title === 'string' && post.title.toLowerCase().includes(keyword.toLowerCase())) {
            snippet = `标题匹配: "${post.title}"`
          } else if (post.summary && typeof post.summary === 'string' && post.summary.toLowerCase().includes(keyword.toLowerCase())) {
            snippet = `摘要匹配: "${post.summary.substring(0, Math.min(100, post.summary.length))}..."`
          } else if (post.tags && Array.isArray(post.tags) && post.tags.some(tag => tag?.name && tag.name.toLowerCase().includes(keyword.toLowerCase()))) {
            const matchedTags = post.tags.filter(tag => tag?.name && tag.name.toLowerCase().includes(keyword.toLowerCase()))
            snippet = `标签匹配: ${matchedTags.map(tag => tag.name).join(', ')}`
          } else if (post.category && typeof post.category === 'string' && post.category.toLowerCase().includes(keyword.toLowerCase())) {
            snippet = `分类匹配: ${post.category}`
          } else {
            snippet = `在文章信息中找到匹配: "${keyword}"`
          }
          
          results.push({
            postId: post.id || post.short_id,
            post,
            snippet,
            matchIndex: 0
          })
        }
      }
      
      return results
    } catch (error) {
      console.error('Search content error:', error)
      return []
    } finally {
      setIsSearching(false)
    }
  }

  return {
    searchContent,
    isSearching,
    highlightText
  }
}

export default useContentSearch 