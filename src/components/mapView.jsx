import React, { useEffect, useState, useRef } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import { useNavigate } from "@tanstack/react-router";

const DEFAULT_CENTER = { lat: 22.35, lng: 114.14 };
const DEFAULT_ZOOM = 11;

// [NEW] Helper component to handle camera movement
const CameraControl = ({ selectedVenue }) => {
	const map = useMap("main-map");

	useEffect(() => {
		if (!map || !selectedVenue) return;

		const lat = Number(selectedVenue.latitude);
		const lng = Number(selectedVenue.longitude);

		if (isNaN(lat) || isNaN(lng)) return;

		const OFFSET_AMOUNT = 0.05;
		const targetLat = lat - OFFSET_AMOUNT;

		google.maps.event.trigger(map, "resize");

		// Pan to the OFFSET position, not the actual pin position
		map.panTo({ lat: targetLat, lng });
		map.setZoom(12);
	}, [map, selectedVenue]);

	return null;
};

export default function MapComponent({
	venues = [],
	center = DEFAULT_CENTER,
	zoom = DEFAULT_ZOOM,
	selectedVenue = null,
	onMarkerClick = () => {},
	language = "en",
	resolve = null,
}) {
	const navigate = useNavigate();
	const API_KEY = import.meta.env.VITE_MAP_API_KEY;

	//const [isReloading, setIsReloading] = useState(false);
	const prevLanguage = useRef(language);

	useEffect(() => {
		if (prevLanguage.current !== language) {
			prevLanguage.current = language;
			window.location.reload();
		}
	}, [language]);

	if (!API_KEY) {
		return <div className="p-4 text-red-500">Error: VITE_MAP_API_KEY is missing in .env</div>;
	}

	return (
		<div className="h-[750px] w-full rounded-md overflow-hidden shadow-md border border-gray-200">
			<APIProvider key={language} apiKey={API_KEY} language={language === "zh" ? "zh-HK" : "en"}>
				<Map
					// [CRITICAL] Add this ID so useMap("main-map") can find it
					id="main-map"
					defaultCenter={center}
					defaultZoom={zoom}
					mapId="DEMO_MAP_ID"
					gestureHandling={"greedy"}
					disableDefaultUI={false}
				>
					{/* This component handles the zooming logic */}
					<CameraControl selectedVenue={selectedVenue} />

					{venues.map((venue) => {
						if (!venue.latitude || !venue.longitude) return null;

						const isSelected = selectedVenue?._id === venue._id;

						const markerTitle = resolve
							? resolve(venue, "name")
							: language === "zh"
								? venue.nameChinese || venue.name
								: venue.name;

						return (
							<AdvancedMarker
								key={venue._id}
								position={{ lat: Number(venue.latitude), lng: Number(venue.longitude) }}
								onClick={() => onMarkerClick(venue)}
								zIndex={isSelected ? 100 : 1}
								title={markerTitle}
							>
								<Pin
									background={isSelected ? "#2563EB" : "#E11D48"}
									glyphColor={"#FFF"}
									borderColor={"#FFF"}
									scale={isSelected ? 1.3 : 1.0}
								/>
							</AdvancedMarker>
						);
					})}
				</Map>
			</APIProvider>
		</div>
	);
}
