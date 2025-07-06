import { useState, useEffect } from 'react'
import { getPage } from '@/lib/notion/getPostBlocks'
import { idToUuid } from 'notion-utils'

/**
 * 内容搜索组件
 * 用于搜索文章内容并返回匹配的片段
 */
const useContentSearch = () => {
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])

  // 提取文章内容文本的函数
  const extractContentText = (blockMap) => {
    if (!blockMap || !blockMap.block) return ''
    
    let contentText = ''
    const blocks = Object.values(blockMap.block)
    
    blocks.forEach(block => {
      if (block.value && block.value.properties) {
        // 处理不同类型的文本块
        if (block.value.properties.title) {
          contentText += block.value.properties.title.map(item => item[0]).join(' ') + ' '
        }
        if (block.value.properties.text) {
          contentText += block.value.properties.text.map(item => item[0]).join(' ') + ' '
        }
        if (block.value.properties.caption) {
          contentText += block.value.properties.caption.map(item => item[0]).join(' ') + ' '
        }
      }
    })
    
    return contentText
  }

  // 获取匹配内容片段的函数
  const getContentSnippet = (contentText, keyword, maxLength = 200) => {
    if (!keyword || !contentText) return ''
    
    const index = contentText.toLowerCase().indexOf(keyword.toLowerCase())
    if (index === -1) return ''
    
    const start = Math.max(0, index - 50)
    const end = Math.min(contentText.length, index + keyword.length + 50)
    let snippet = contentText.substring(start, end)
    
    if (start > 0) snippet = '...' + snippet
    if (end < contentText.length) snippet = snippet + '...'
    
    return snippet
  }

  // 搜索文章内容
  const searchContent = async (keyword, posts) => {
    if (!keyword || !posts || posts.length === 0) {
      return []
    }

    setIsSearching(true)
    const results = []

    try {
      for (const post of posts) {
        try {
          // 处理Notion页面ID格式
          let postId = post.id || post.short_id
          if (postId && postId.includes('-')) {
            postId = idToUuid(postId)
          }

          if (!postId) continue

          // 获取文章内容
          const blockMap = await getPage(postId, 'search')
          if (!blockMap) continue

          // 提取内容文本
          const contentText = extractContentText(blockMap)
          
          // 搜索内容
          if (contentText.toLowerCase().indexOf(keyword.toLowerCase()) > -1) {
            const snippet = getContentSnippet(contentText, keyword)
            results.push({
              postId: post.id || post.short_id,
              post,
              snippet,
              matchIndex: contentText.toLowerCase().indexOf(keyword.toLowerCase())
            })
          }
        } catch (error) {
          console.error(`Error searching post ${post.id}:`, error)
          continue
        }
      }
    } catch (error) {
      console.error('Content search error:', error)
    } finally {
      setIsSearching(false)
    }

    return results
  }

  return {
    searchContent,
    isSearching,
    searchResults
  }
}

export default useContentSearch 