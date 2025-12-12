import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/')({
   component: HomePage,
})

const LOCATIONS_URL = 'https://www.lcsd.gov.hk/datagovhk/event/venues.xml'
const EVENTS_URL = 'https://www.lcsd.gov.hk/datagovhk/event/events.xml'

function HomePage() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    async function load() {
      const locationsFetch = await fetch(LOCATIONS_URL)
      const eventsFetch = await fetch(EVENTS_URL)

      const locationsXmlText = await locationsFetch.text()
      const eventsXmlText = await eventsFetch.text()

      const parser = new DOMParser()
      const locationsFullString = parser.parseFromString(locationsXmlText, 'application/xml')
      const eventsFullString = parser.parseFromString(eventsXmlText, 'application/xml')

      // Getting array of locations
      const locationArray = Array.from(locationsFullString.getElementsByTagName('venue'))

      const locations = locationArray.map((node) => {
        const id = node.getAttribute('id')?.trim()
        const name = node.getElementsByTagName('venuee')[0]?.textContent?.trim()

        return { id, name }
      })

      // Getting no. of events per location
      const eventArray = Array.from(eventsFullString.getElementsByTagName('event'))
      const eventCounts = new Map()

      for (const event of eventArray) {
        const locationId = event.getElementsByTagName('venueid')[0].textContent.trim()
        if (!locationId) continue

        eventCounts.set(locationId, (eventCounts.get(locationId) ?? 0) + 1)
      }

      // First 10 locations with events
      const locationsOutput = locations.slice(0, 10)
      const rowsWithCounts = locationsOutput.map((loc, index) => ({
        index: index + 1,
        location: loc.name,
        eventCount: eventCounts.get(loc.id),
      }))

      setRows(rowsWithCounts)
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
                Location
              </th>
              <th className="border-b px-3 py-2 text-left font-medium">
                No. of Events
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="odd:bg-background even:bg-muted/40">
                <td className="border-b px-3 py-2">{row.index}</td>
                <td className="border-b px-3 py-2">{row.location}</td>
                <td className="border-b px-3 py-2">{row.eventCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default HomePage
