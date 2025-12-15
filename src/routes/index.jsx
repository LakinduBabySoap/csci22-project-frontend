import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react'
import { getAllVenues, addFavoriteVenue, removeFavoriteVenue, getFavoriteVenues } from '@/services/venues'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AlertCircleIcon } from 'lucide-react'
import MapComponent from '@/components/mapView.jsx'
import { getVenues } from '@/services/venues'
export const Route = createFileRoute('/')({
	component: HomePage,
})

// Default to be Pi Chiu Building, CUHK
const user_latitude = 22.41975
const user_longitude = 114.20644

const degToRad = (deg) => (deg * Math.PI) / 180

function HomePage() {
  const [locations, setLocations] = useState([])
  const [favoriteIds, setFavoriteIds] = useState([])
  // key: "name", "events", "distance", null
  // direction: "asc", "desc", null
  const [sortingState, setSortingState] = useState({ key: null, direction: null })
  // searched text
	const [searchTerm, setSearchTerm] = useState('')
	// within ? km
	const [maxDistance, setmaxDistance] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const showError = (message) => {
    setError(message)
    setTimeout(() => setError(null), 5000)
  }
    //merge conflict issue
  // useEffect(() => {
	// 	async function load() {
	// 		const data = await getVenues()
  useEffect(() => {
    async function load() {
      try{
      //const res = await fetch('http://localhost:3000/api/venues')
        const [venuesData, favoritesData] = await Promise.all([
          getAllVenues(),
          getFavoriteVenues()
        ])
      //console.log('All venues (first 3):', venuesData.slice(0, 3).map(v => ({ _id: v._id, name: v.name })));
      //console.log('Favorites from backend:', favoritesData);
      
      // Extract favorite IDs from venue objects
      const favIds = favoritesData.map((fav) => {
      //console.log(' Favorite venue _id:', fav._id, 'Type:', typeof fav._id);
        return fav._id;
      });

      //console.log(' Extracted favorite IDs:', favIds);
      setFavoriteIds(favIds);
			const appendDistances = venuesData.map((loc) => {
				const a =
					Math.sin(degToRad(loc.latitude - user_latitude) / 2) ** 2 +
					Math.cos(degToRad(user_latitude)) *
						Math.cos(degToRad(loc.latitude)) *
						Math.sin(degToRad(loc.longitude - user_longitude) / 2) ** 2

				const distance = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        return {
          ...loc,
          distance,  // add distance field
          //favorite: loc.isFavorite || false,  // add favorite field, default to false
        }
      })
console.log('🔍 First venue from list:', appendDistances[0]?._id, 'Type:', typeof appendDistances[0]?._id);
      console.log('🔍 Does first favorite match any venue?', appendDistances.some(v => v._id === favIds[0]));

      setLocations(appendDistances)   // array of venues
    } catch (err) {
        showError('Failed to load venues')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

const toggleFavorite = async (venueId) => {
    const isFavorited = favoriteIds.includes(venueId)  
    
    try {
      if (isFavorited) {
        // Remove from favorites
        await removeFavoriteVenue(venueId)
        setFavoriteIds((prev) => prev.filter((id) => id !== venueId))
      } else {
        // Add to favorites
        await addFavoriteVenue(venueId)
        setFavoriteIds((prev) => [...prev, venueId])
      }
    } catch (err) {
      showError('Failed to update favorite')
      console.error(err)
    }
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
		let arr = [...locations]
		
		// Search location
		const st1 = searchTerm.trim().toLowerCase()
		if (st1) {
			arr = arr.filter((loc) =>
				loc.name.toLowerCase().includes(st1)
			)
		}

		// Search distance
		const st2 = maxDistance.trim()
		if (st2 !== '') {
			const maxKm = Number(st2)
			if (!Number.isNaN(maxKm) && maxKm >= 0) {
				arr = arr.filter((loc) => loc.distance <= maxKm)
			}
		}

		// If not sorted
		if (!sortingState.key || !sortingState.direction) {
			return arr
		}

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
	}, [locations, sortingState, searchTerm, maxDistance])

  const sortLabel = (key) => {
    if (sortingState.key !== key || !sortingState.direction) return ''
    if (sortingState.direction === 'asc') return ' ▲'
    if (sortingState.direction === 'desc') return ' ▼'
  }
  if (loading) return <div className = "p-8">Loading...</div>

	return (
		<div className="p-4">
			<h1 className="mb-4 text-2xl font-bold">
				Locations
			</h1>

			<div className="mb-4">
				<input
					type="text"
					placeholder="Search Location"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full max-w-sm rounded border px-3 py-2 text-sm"
				/>
				<input
					type="text"
					inputMode="numeric"
					min="0"
					placeholder="Within (km)"
					value={maxDistance}
					onChange={(e) => {
						const val = e.target.value
						if (/^[0-9]*$/.test(val)) {
							setmaxDistance(val)
						}
					}}
					className="w-full max-w-xs rounded border px-3 py-2 text-sm"
				/>
			</div>

			<div className="overflow-x-auto rounded border">
				<table className="min-w-full border-collapse text-sm">
					<thead className="bg-muted">
						<tr>
							<th className="border-b px-3 py-2 text-left font-medium">
								#
							</th>
							<th
								className="border-b px-3 py-2 text-left font-medium cursor-pointer select-none"
								onClick={() => handleSort('name')}
							>
								Name of Location{sortLabel('name')}
							</th>
							<th
								className="border-b px-3 py-2 text-left font-medium cursor-pointer select-none"
								onClick={() => handleSort('events')}
							>
								No. of Events{sortLabel('events')}
							</th>
							<th
								className="border-b px-3 py-2 text-left font-medium cursor-pointer select-none"
								onClick={() => handleSort('distance')}
							>
								Distance{sortLabel('distance')}
							</th>
							<th className="border-b px-3 py-2 text-center font-medium">
								Add to Favorite
							</th>
						</tr>
					</thead>
					<tbody>
						{sortedLocations.map((row, i) => (
							// <tr key={row.venueId} className="odd:bg-background even:bg-muted/40">
              <tr key={row._id} className="odd:bg-background even:bg-muted/40">
								<td className="border-b px-3 py-2">{i + 1}</td>
								<td className="border-b px-3 py-2">{row.name}</td>
								<td className="border-b px-3 py-2">{row.events.length}</td>
								<td className="border-b px-3 py-2">
									{row.distance.toFixed(2)} km
								</td>
								<td className="border-b px-3 py-2 text-center">
									<input
										type="checkbox"
										checked={favoriteIds.includes(row._id)}
										// onChange={() => toggleFavorite(row.venueId)}
                    onChange={() => toggleFavorite(row._id)}
										className="h-5 w-5 cursor-pointer"
									/>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div>
				<h2 className="mb-4 text-xl font-bold">Map View</h2>
				{/* Pass sortedLocations to mapComponent */}
				<MapComponent venues={sortedLocations} />
      		</div>
		</div>
	)
}

export default HomePage