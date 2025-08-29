import { useState } from 'react'

export default function SearchPage() {
  const [data, setData] = useState([]) // loaded from CSV
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loadMsg, setLoadMsg] = useState('No data loaded. Upload a CSV to begin.')

  const detectDelimiter = (line) => (line.includes(',') ? ',' : line.includes('\t') ? '\t' : ',')

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
        date: row.date || row.Date || '',
        brand: row.brand || row.Brand || '',
        item: row.item || row.Item || '',
        platform: row.platform || row.Platform || '',
        price:
          row.price !== undefined
            ? Number(String(row.price).replace(/[^0-9.-]/g, ''))
            : row.Price
            ? Number(String(row.Price).replace(/[^0-9.-]/g, ''))
            : NaN,
      }
    }).filter((r) => r.item && r.platform)
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const rows = parseCSV(String(reader.result || ''))
        setData(rows)
        setResults([])
        setSuggestions([])
        setLoadMsg(`Loaded ${rows.length} rows from ${file.name}.`)
      } catch (err) {
        console.error(err)
        setLoadMsg('Failed to parse CSV. Please check the file format.')
      }
    }
    reader.readAsText(file, 'utf-8')
  }

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
        {/* CSV Uploader */}
        <div className="p-3 bg-white rounded-lg shadow">
          <label className="block text-sm font-medium mb-2">
            Upload CSV (date, brand, item, platform, price)
          </label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFile}
            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <div className="text-xs text-gray-500 mt-2">{loadMsg}</div>
        </div>

        {/* Search Box + Suggestions */}
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

      {/* Results */}
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
            Upload a CSV to enable search.
          </div>
        )}
      </div>
    </div>
  )
}
