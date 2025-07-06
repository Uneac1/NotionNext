import { deepClone } from '@/lib/utils'
import { useNavGlobal } from '@/themes/nav'
import { useImperativeHandle, useRef, useState } from 'react'
import useContentSearch from './ContentSearch'
let lock = false

const SearchInput = ({ currentSearch, cRef, className }) => {
  const searchInputRef = useRef()
  const { setFilteredNavPages, allNavPages } = useNavGlobal()
  const { searchContent, isSearching, highlightText } = useContentSearch()

  useImperativeHandle(cRef, () => {
    return {
      focus: () => {
        searchInputRef?.current?.focus()
      }
    }
  })

  const handleSearch = async () => {
    let keyword = searchInputRef.current.value
    if (keyword) {
      keyword = keyword.trim()
    } else {
      setFilteredNavPages(allNavPages)
      return
    }
    
    const filterAllNavPages = deepClone(allNavPages)
    
    // 首先搜索标题和摘要
    for (let i = filterAllNavPages.length - 1; i >= 0; i--) {
      const post = filterAllNavPages[i]
      const articleInfo = post.title + ' ' + (post.summary || '')
      
      // 搜索标题和摘要
      const hit = articleInfo.toLowerCase().indexOf(keyword.toLowerCase()) > -1
      
      if (hit) {
        // 高亮匹配的标题或摘要
        if (post.title.toLowerCase().indexOf(keyword.toLowerCase()) > -1) {
          post.highlightedTitle = highlightText(post.title, keyword)
        }
        if (post.summary && post.summary.toLowerCase().indexOf(keyword.toLowerCase()) > -1) {
          post.highlightedSummary = highlightText(post.summary, keyword)
        }
      }
      
      if (!hit) {
        // 删除
        filterAllNavPages.splice(i, 1)
      }
    }

    // 如果标题和摘要没有找到结果，搜索其他内容
    if (filterAllNavPages.length === 0) {
      const contentResults = await searchContent(keyword, allNavPages)
      
      // 根据内容搜索结果重新构建列表
      const contentMatchedPosts = []
      for (const result of contentResults) {
        const post = allNavPages.find(p => (p.id || p.short_id) === result.postId)
        if (post) {
          const highlightedPost = { ...post }
          highlightedPost.matchedContent = highlightText(result.snippet, keyword)
          contentMatchedPosts.push(highlightedPost)
        }
      }
      
      setFilteredNavPages(contentMatchedPosts)
    } else {
      // 如果标题和摘要有结果，也搜索其他内容以添加内容片段
      const contentResults = await searchContent(keyword, filterAllNavPages)
      
      // 为已有结果添加内容片段
      for (const result of contentResults) {
        const post = filterAllNavPages.find(p => (p.id || p.short_id) === result.postId)
        if (post && !post.highlightedTitle && !post.highlightedSummary) {
          post.matchedContent = highlightText(result.snippet, keyword)
        }
      }
      
      setFilteredNavPages(filterAllNavPages)
    }
  }

  /**
   * 回车键
   * @param {*} e
   */
  const handleKeyUp = e => {
    if (e.keyCode === 13) {
      // 回车
      handleSearch(searchInputRef.current.value)
    } else if (e.keyCode === 27) {
      // ESC
      cleanSearch()
    }
  }

  /**
   * 清理搜索
   */
  const cleanSearch = () => {
    searchInputRef.current.value = ''
    handleSearch()
    setShowClean(false)
  }

  const [showClean, setShowClean] = useState(false)
  const updateSearchKey = val => {
    if (lock) {
      return
    }
    searchInputRef.current.value = val

    if (val) {
      setShowClean(true)
    } else {
      setShowClean(false)
    }
  }
  function lockSearchInput() {
    lock = true
  }

  function unLockSearchInput() {
    lock = false
  }

  return (
    <div
      className={
        'flex w-36 hover:w-36 md:hover:w-56 md:w-56 transition md:mr-5'
      }>
      <input
        ref={searchInputRef}
        type='text'
        className={`${className} outline-none w-full text-sm pl-4 transition-all duration-200 ease-in focus:shadow-lg font-light leading-10 text-black bg-opacity-50 md:bg-opacity-100 bg-neutral-100 md:hover:bg-neutral-200 md:focus:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 dark:text-white`}
        onKeyUp={handleKeyUp}
        onCompositionStart={lockSearchInput}
        onCompositionUpdate={lockSearchInput}
        onCompositionEnd={unLockSearchInput}
        onChange={e => updateSearchKey(e.target.value)}
        defaultValue={currentSearch}
        placeholder={isSearching ? '搜索中...' : '搜索文章'}
      />

      <div
        className='flex -ml-6 cursor-pointer float-right items-center justify-center py-2'
        onClick={handleSearch}>
        <i
          className={
            isSearching 
              ? 'fas fa-spinner animate-spin text-neutral-400'
              : 'hover:text-black transform duration-200 text-neutral-500 dark:hover:text-gray-300 cursor-pointer fas fa-search'
          }
        />
      </div>

      {showClean && (
        <div className='flex -ml-8 cursor-pointer float-right items-center justify-center py-2'>
          <i
            className='fas fa-times hover:text-black transform duration-200 text-neutral-400 cursor-pointer dark:hover:text-gray-300'
            onClick={cleanSearch}
          />
        </div>
      )}
    </div>
  )
}

export default SearchInput
