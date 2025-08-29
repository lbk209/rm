import { useState, useEffect } from 'react'

export default function SearchPage() {
  const [data, setData] = useState([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loadMsg, setLoadMsg] = useState('Loading sample data...')

  const detectDelimiter = (line) =>
    line.includes(',') ? ',' : line.includes('\t') ? '\t' : ','

  const parseCSV = (text) => {
    const lines = text.trim().split(/\r?\n/).filter(Boolean)
    if (lines.length === 0) return []
    const delim = detectDelimiter(lines[0])
    const headers = lines[0].split(delim).map((h) => h.trim())
    return lines.slice(1).map((line) => {
      const cols = line.split(delim).map((c) => c.trim())
      const row = {}
      headers.forEach((h, i) => (row[h] = cols[i] ?? ''))
      return {
        date: row.date,
        brand: row.brand,
        item: row.item,
        platform: row.platform,
        price: Number(row.price),
      }
    })
  }

  // Auto-load sample.csv from public/
  useEffect(() => {
    fetch('/rm_chicken_250829.csv')
      .then((res) => res.text())
      .then((text) => {
        const rows = parseCSV(text)
        setData(rows)
        setLoadMsg(`Loaded ${rows.length} sample rows.`)
      })
      .catch(() => setLoadMsg('Failed to load sample data.'))
  }, [])

  const handleSearch = (searchQuery = query) => {
    const q = searchQuery.trim()
    const filtered = data.filter((row) => row.item.includes(q))
    setResults(filtered)
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)

    if (value.trim() === '' || data.length === 0) {
      setSuggestions([])
      return
    }

    const uniqueItems = [...new Set(data.map((row) => row.item))]
    const matched = uniqueItems.filter((item) => item.startsWith(value.trim()))
    setSuggestions(matched)
  }

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion)
    setSuggestions([])
    handleSearch(suggestion)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-md space-y-3">
        <div className="text-sm text-gray-500">{loadMsg}</div>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search item..."
            className="w-full p-2 border rounded-lg shadow-sm"
            disabled={data.length === 0}
          />
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow mt-1 z-10">
              {suggestions.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSuggestionClick(s)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {s}
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => handleSearch()}
            className="mt-2 w-full bg-blue-500 text-white py-2 rounded-lg shadow hover:bg-blue-600 disabled:opacity-50"
            disabled={data.length === 0}
          >
            Search
          </button>
        </div>
      </div>

      <div className="w-full max-w-md mt-6 space-y-2">
        {results.map((row, index) => (
          <div key={index} className="p-3 bg-white rounded-lg shadow">
            <div className="font-semibold">{row.item}</div>
            <div className="font-semibold">{row.platform}</div>
            <div className="text-gray-700">
              {Number.isFinite(row.price) ? `₩${row.price.toLocaleString()}` : '-'}
            </div>
            <div className="text-gray-500 text-sm">{row.date}</div>
          </div>
        ))}
        {results.length === 0 && query && (
          <div className="p-3 bg-white rounded-lg shadow text-gray-500">
            No results found.
          </div>
        )}
        {data.length === 0 && (
          <div className="p-3 bg-white rounded-lg shadow text-gray-500">
            Sample data not loaded.
          </div>
        )}
      </div>
    </div>
  )
}
