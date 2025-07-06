import { deepClone } from '@/lib/utils'
import { useHeo2Global } from '@/themes/heo2'
import { useRouter } from 'next/router'
import { useImperativeHandle, useRef, useState, useCallback } from 'react'
import { useGlobal } from '@/lib/global'
import throttle from 'lodash.throttle'
let lock = false

const SearchInput = props => {
  const { currentSearch, cRef, className } = props
  const [onLoading, setLoadingState] = useState(false)
  const router = useRouter()
  const searchInputRef = useRef()
  const { locale } = useGlobal()
  const { setFilteredNavPages, allNavPages } = useHeo2Global()
  
  useImperativeHandle(cRef, () => {
    return {
      focus: () => {
        searchInputRef?.current?.focus()
      }
    }
  })

  const handleSearch = () => {
    const key = searchInputRef.current.value
    if (key && key !== '') {
      setLoadingState(true)
      router.push({ pathname: '/search/' + key }).then(r => {
        setLoadingState(false)
      })
      // location.href = '/search/' + key
    } else {
      router.push({ pathname: '/' }).then(r => {})
    }
  }

  // 实时搜索功能（类似nav主题）- 使用防抖优化性能
  const handleRealTimeSearch = useCallback(
    throttle(() => {
      let keyword = searchInputRef.current.value
      if (keyword) {
        keyword = keyword.trim()
      } else {
        setFilteredNavPages(allNavPages || [])
        return
      }
      
      if (!allNavPages || allNavPages.length === 0) {
        return
      }

      const filterAllNavPages = deepClone(allNavPages)
      for (let i = filterAllNavPages.length - 1; i >= 0; i--) {
        const post = filterAllNavPages[i]
        const articleInfo = post.title + ' ' + (post.summary || '')
        const hit = articleInfo.toLowerCase().indexOf(keyword.toLowerCase()) > -1
        if (!hit) {
          // 删除
          filterAllNavPages.splice(i, 1)
        }
      }

      // 更新搜索结果
      setFilteredNavPages(filterAllNavPages)
    }, 300),
    [allNavPages, setFilteredNavPages]
  )

  const handleKeyUp = e => {
    if (e.keyCode === 13) {
      // 回车
      handleSearch(searchInputRef.current.value)
    } else if (e.keyCode === 27) {
      // ESC
      cleanSearch()
    }
  }
  
  const cleanSearch = () => {
    searchInputRef.current.value = ''
    setFilteredNavPages(allNavPages || [])
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
      // 实时搜索
      handleRealTimeSearch()
    } else {
      setShowClean(false)
      setFilteredNavPages(allNavPages || [])
    }
  }
  
  function lockSearchInput () {
    lock = true
  }

  function unLockSearchInput () {
    lock = false
  }

  return (
    <div className={'flex w-36 hover:w-36 md:hover:w-56 md:w-56 transition md:mr-5'}>
      <input
        ref={searchInputRef}
        type="text"
        className={`${className} outline-none w-full text-sm pl-4 transition-all duration-200 ease-in focus:shadow-lg font-light leading-10 text-black bg-opacity-50 md:bg-opacity-100 bg-neutral-100 md:hover:bg-neutral-200 md:focus:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 dark:text-white rounded-full`}
        onKeyUp={handleKeyUp}
        onCompositionStart={lockSearchInput}
        onCompositionUpdate={lockSearchInput}
        onCompositionEnd={unLockSearchInput}
        placeholder={locale.SEARCH.ARTICLES}
        onChange={e => updateSearchKey(e.target.value)}
        defaultValue={currentSearch || ''}
      />

      <div
        className="-ml-6 cursor-pointer float-right items-center justify-center py-2"
        onClick={handleSearch}
      >
        <i
          className={`hover:text-black transform duration-200 text-neutral-500 dark:hover:text-gray-300 cursor-pointer fas ${
            onLoading ? 'fa-spinner animate-spin' : 'fa-search'
          }`}
        />
      </div>

      {showClean && (
        <div className="-ml-8 cursor-pointer float-right items-center justify-center py-2">
          <i
            className="fas fa-times hover:text-black transform duration-200 text-neutral-400 cursor-pointer dark:hover:text-gray-300"
            onClick={cleanSearch}
          />
        </div>
      )}
    </div>
  )
}

export default SearchInput
