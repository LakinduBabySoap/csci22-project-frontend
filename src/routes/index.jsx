import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/')({
   component: HomePage,
})

const LOCATIONS_URL = 'https://www.lcsd.gov.hk/datagovhk/event/venues.xml'
const EVENTS_URL = 'https://www.lcsd.gov.hk/datagovhk/event/events.xml'

function HomePage() {
  const [locations, setLocations] = useState([])

  useEffect(() => {
    async function load() {
      const res = await fetch('http://localhost:3000/api/venues')
      const data = await res.json()
      setLocations(data)   // array of venues
    }

    load()
  }, [])

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">
        Locations
      </h1>

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="border-b px-3 py-2 text-left font-medium">#</th>
              <th className="border-b px-3 py-2 text-left font-medium">
                Name of Location
              </th>
              <th className="border-b px-3 py-2 text-left font-medium">
                Latitude
              </th>
              <th className="border-b px-3 py-2 text-left font-medium">
                Longitude
              </th>
            </tr>
          </thead>
          <tbody>
            {locations.map((row, i) => (
              <tr key={row.id} className="odd:bg-background even:bg-muted/40">
                <td className="border-b px-3 py-2">{i + 1}</td>
                <td className="border-b px-3 py-2">{row.name}</td>
                <td className="border-b px-3 py-2">{row.latitude}</td>
                <td className="border-b px-3 py-2">{row.longitude}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default HomePage
