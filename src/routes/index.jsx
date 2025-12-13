import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react'

export const Route = createFileRoute('/')({
    component: HomePage,
})

// Default to be Pi Chiu Building, CUHK
const user_latitude = 22.41975
const user_longitude = 114.20644

const degToRad = (deg) => (deg * Math.PI) / 180

function HomePage() {
  const [locations, setLocations] = useState([])
  // key: "name", "events", "distance", null
  // direction: "asc", "desc", null
  const [sortingState, setSortingState] = useState({ key: null, direction: null })

  useEffect(() => {
    async function load() {
      const res = await fetch('http://localhost:3000/api/venues')
      const data = await res.json()

      const appendDistances = data.map((loc) => {
        const a =
          Math.sin(degToRad(loc.latitude - user_latitude) / 2) ** 2 +
          Math.cos(degToRad(user_latitude)) * Math.cos(degToRad(loc.latitude)) * Math.sin(degToRad(loc.longitude - user_longitude) / 2) ** 2

        const distance = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        return {
          ...loc,
          distance,  // add distance field
          favorite: false,  // add favorite field, default to false
        }
      })

      setLocations(appendDistances)   // array of venues
    }

    load()
  }, [])

  const toggleFavorite = (venueId) => {
    setLocations((prevLocation) =>
      prevLocation.map((loc) =>
        loc.venueId === venueId ? { ...loc, favorite: !loc.favorite } : loc
      )
    )
  }

  const handleSort = (key) => {
    setSortingState((prevSortingState) => {
      // Sort another column when another column is sorted
      if (prevSortingState.key !== key) {
        return { key, direction: 'asc' }
      }
      // Ascending -> Descending -> None
      if (prevSortingState.direction === 'asc') return { key, direction: 'desc' }
      if (prevSortingState.direction === 'desc') return { key: null, direction: null }
      return { key, direction: 'asc' }
    })
  }

  const sortedLocations = useMemo(() => {
    // If not sorted
    if (!sortingState.key || !sortingState.direction) {
      return locations
    }

    const arr = [...locations]

    arr.sort((a, b) => {
      if (sortingState.key === 'name') {
        const aName = a.name.toLowerCase()
        const bName = b.name.toLowerCase()
        const cmp = aName.localeCompare(bName)
        return sortingState.direction === 'asc' ? cmp : -cmp
      }

      let aVal
      let bVal
      if (sortingState.key === 'events') {
        aVal = a.events.length
        bVal = b.events.length
      } else if (sortingState.key === 'distance') {
        aVal = a.distance
        bVal = b.distance
      } else {
        return 0
      }

      if (aVal < bVal) return sortingState.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortingState.direction === 'asc' ? 1 : -1
      return 0
    })

    return arr
  }, [locations, sortingState])

  const sortLabel = (key) => {
    if (sortingState.key !== key || !sortingState.direction) return ''
    if (sortingState.direction === 'asc') return ' ▲'
    if (sortingState.direction === 'desc') return ' ▼'
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">
        Locations
      </h1>

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="border-b px-3 py-2 text-left font-medium">
                #
              </th>
              <th className="border-b px-3 py-2 text-left font-medium cursor-pointer select-none" onClick={() => handleSort('name')}>
                Name of Location{sortLabel('name')}
              </th>
              <th className="border-b px-3 py-2 text-left font-medium cursor-pointer select-none" onClick={() => handleSort('events')}>
                No. of Events{sortLabel('events')}
              </th>
              <th className="border-b px-3 py-2 text-left font-medium cursor-pointer select-none" onClick={() => handleSort('distance')}>
                Distance{sortLabel('distance')}
              </th>
              <th className="border-b px-3 py-2 text-center font-medium">
                Add to Favorite
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedLocations.map((row, i) => (
              <tr key={row.venueId} className="odd:bg-background even:bg-muted/40">
                <td className="border-b px-3 py-2">{i + 1}</td>
                <td className="border-b px-3 py-2">{row.name}</td>
                <td className="border-b px-3 py-2">{row.events.length}</td>
                <td className="border-b px-3 py-2">{row.distance.toFixed(2)} km</td>
                <td className="border-b px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={row.favorite}
                    onChange={() => toggleFavorite(row.venueId)}
                    className="h-5 w-5 cursor-pointer"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default HomePage