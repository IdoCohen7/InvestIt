import { useSearchParams } from 'react-router-dom'
import SearchResultsComponent from './components/SearchResult'

const SearchPage = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  return <SearchResultsComponent query={query} />
}

export default SearchPage
