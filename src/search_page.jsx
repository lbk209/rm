import { useState } from 'react'
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
