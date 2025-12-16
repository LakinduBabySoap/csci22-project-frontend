import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { getAllVenues, addFavoriteVenue, removeFavoriteVenue, getFavoriteVenues } from "@/services/venues";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import MapComponent from "@/components/mapView.jsx";
import { getVenues } from "@/services/venues";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, MapPin, Calendar, MessageSquare, Send } from 'lucide-react'

export const Route = createFileRoute("/")({
	component: HomePage,

	beforeLoad: () => {
        // Check if the token exists in local storage
        const token = localStorage.getItem("token");
        // If no token found, redirect to the login page
        if (!token) {
			console.log("yes")
            throw redirect({
                to: "login/index.jsx", // Make sure your login route is named '/login'
            });
        };
	},
});

// Default to be Pi Chiu Building, CUHK
const user_latitude = 22.41975;
const user_longitude = 114.20644;

const degToRad = (deg) => (deg * Math.PI) / 180;

function HomePage() {
	const [locations, setLocations] = useState([]);
	const [favoriteIds, setFavoriteIds] = useState([]);
	// key: "name", "events", "distance", null
	// direction: "asc", "desc", null
	const [sortingState, setSortingState] = useState({ key: null, direction: null });
	// searched text
	const [searchTerm, setSearchTerm] = useState("");
	// within ? km
	const [maxDistance, setmaxDistance] = useState("");
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);

	const [selectedVenue, setSelectedVenue] = useState(null)
	const [comments, setComments] = useState([]);
	const [newComment, setNewComment] = useState("")

	const showError = (message) => {
		setError(message);
		setTimeout(() => setError(null), 5000);
	};
	//merge conflict issue
	// useEffect(() => {
	// 	async function load() {
	// 		const data = await getVenues()
	useEffect(() => {
		async function load() {
			try {
				//const res = await fetch('http://localhost:3000/api/venues')
				const [venuesData, favoritesData] = await Promise.all([getAllVenues(), getFavoriteVenues()]);
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
							Math.sin(degToRad(loc.longitude - user_longitude) / 2) ** 2;

					const distance = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

					return {
						...loc,
						distance, // add distance field
						//favorite: loc.isFavorite || false,  // add favorite field, default to false
					};
				});
				console.log("🔍 First venue from list:", appendDistances[0]?._id, "Type:", typeof appendDistances[0]?._id);
				console.log(
					"🔍 Does first favorite match any venue?",
					appendDistances.some((v) => v._id === favIds[0])
				);

				setLocations(appendDistances); // array of venues
			} catch (err) {
				showError("Failed to load venues");
				console.error(err);
			} finally {
				setLoading(false);
			}
		}
		load();
	}, []);
	
	const handleSelectVenue = (venue) => {
        setSelectedVenue(venue);
        // Reset mock comments when changing venue (In real app, fetch from API here)
        setComments([
            { user: "User A", text: "Great place!", date: "2024-01-12" },
            { user: "User B", text: "Parking is hard to find.", date: "2024-02-05" }
        ]);
    };

	const handleAddComment = () => {
        if (!newComment.trim()) return;
        setComments([...comments, { user: "Me", text: newComment, date: new Date().toISOString().split('T')[0] }]);
        setNewComment("");
    };

	const handleCloseView = () => {
        setSelectedVenue(null);
    };

	const toggleFavorite = async (venueId) => {
		const isFavorited = favoriteIds.includes(venueId);

		try {
			if (isFavorited) {
				// Remove from favorites
				await removeFavoriteVenue(venueId);
				setFavoriteIds((prev) => prev.filter((id) => id !== venueId));
			} else {
				// Add to favorites
				await addFavoriteVenue(venueId);
				setFavoriteIds((prev) => [...prev, venueId]);
			}
		} catch (err) {
			showError("Failed to update favorite");
			console.error(err);
		}
	};

	const handleSort = (key) => {
		setSortingState((prevSortingState) => {
			//if selected one specific location, no sort is needed
			if (selectedVenue) return;
			// Sort another column when another column is sorted
			if (prevSortingState.key !== key) {
				return { key, direction: "asc" };
			}
			// Ascending -> Descending -> None
			if (prevSortingState.direction === "asc") return { key, direction: "desc" };
			if (prevSortingState.direction === "desc") return { key: null, direction: null };
			return { key, direction: "asc" };
		});
	};

	const sortedLocations = useMemo(() => {
		// If a location is selected, ONLY return that location
		if (selectedVenue) {
            return [selectedVenue];
        }

		let arr = [...locations]
		
		// Search location
		const st1 = searchTerm.trim().toLowerCase();
		if (st1) {
			arr = arr.filter((loc) => loc.name.toLowerCase().includes(st1));
		}

		// Search distance
		const st2 = maxDistance.trim();
		if (st2 !== "") {
			const maxKm = Number(st2);
			if (!Number.isNaN(maxKm) && maxKm >= 0) {
				arr = arr.filter((loc) => loc.distance <= maxKm);
			}
		}

		// If not sorted
		if (!sortingState.key || !sortingState.direction) {
			return arr;
		}

		arr.sort((a, b) => {
			if (sortingState.key === "name") {
				const aName = a.name.toLowerCase();
				const bName = b.name.toLowerCase();
				const cmp = aName.localeCompare(bName);
				return sortingState.direction === "asc" ? cmp : -cmp;
			}

			let aVal;
			let bVal;
			if (sortingState.key === "events") {
				aVal = a.events.length;
				bVal = b.events.length;
			} else if (sortingState.key === "distance") {
				aVal = a.distance;
				bVal = b.distance;
			} else {
				return 0;
			}

			if (aVal < bVal) return sortingState.direction === "asc" ? -1 : 1;
			if (aVal > bVal) return sortingState.direction === "asc" ? 1 : -1;
			return 0;
		});

		return arr;
	}, [locations, sortingState, searchTerm, maxDistance]);

	const sortLabel = (key) => {
		if (sortingState.key !== key || !sortingState.direction) return "";
		if (sortingState.direction === "asc") return " ▲";
		if (sortingState.direction === "desc") return " ▼";
	};
	if (loading) return <div className="p-8">Loading...</div>;

	return (
		<div className="p-4">
			<div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Locations</h1>
            </div>

			<div className="mb-4">
				<input
					type="text"
					placeholder="Search Location"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full max-w-sm rounded border px-3 py-2 text-sm"
					disabled={!!selectedVenue} 
				/>
				<input
					type="text"
					inputMode="numeric"
					min="0"
					placeholder="Within (km)"
					value={maxDistance}
					onChange={(e) => {
						const val = e.target.value;
						if (/^[0-9]*$/.test(val)) {
							setmaxDistance(val);
						}
					}}
					className="w-full max-w-xs rounded border px-3 py-2 text-sm"
					disabled={!!selectedVenue}
				/>
			</div>

			<div className="overflow-x-auto rounded border">
				<table className="min-w-full border-collapse text-sm">
					<thead className="bg-muted">
						<tr>
							<th className="border-b px-3 py-2 text-left font-medium">#</th>
							<th
								className="border-b px-3 py-2 text-left font-medium cursor-pointer select-none"
								onClick={() => handleSort("name")}
							>
								Name of Location{sortLabel("name")}
							</th>
							<th
								className="border-b px-3 py-2 text-left font-medium cursor-pointer select-none"
								onClick={() => handleSort("events")}
							>
								No. of Events{sortLabel("events")}
							</th>
							<th
								className="border-b px-3 py-2 text-left font-medium cursor-pointer select-none"
								onClick={() => handleSort("distance")}
							>
								Distance{sortLabel("distance")}
							</th>
							<th className="border-b px-3 py-2 text-center font-medium">Add to Favorite</th>
						</tr>
					</thead>
					<tbody>
						{sortedLocations.map((row, i) => (
							<tr key={row._Id} className={`border-b cursor-pointer transition-colors
								${selectedVenue?.venueId === row.venueId ? "bg-blue-50 border-l-4 border-l-blue-500" : "hover:bg-muted/50"}
							`}
							onClick={() => handleSelectVenue(row)} // [MODIFIED] Select venue on click
                        	>
								<td className="border-b px-3 py-2">{i + 1}</td>
								<td className="border-b px-3 py-2">{row.name}</td>
								<td className="border-b px-3 py-2">{row.events.length}</td>
								<td className="border-b px-3 py-2">{row.distance.toFixed(2)} km</td>
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
                {/* [MODIFIED] Pass handlers to map */}
				<MapComponent 
                    venues={sortedLocations} // Pass ALL locations so pins remain visible
                    selectedVenue={selectedVenue} // For zooming
                    onMarkerClick={handleSelectVenue} // For selection
                />
      		</div>

			<Sheet open={!!selectedVenue} modal={false}>
							<SheetContent side="left" className="w-[400px] p-0 shadow-2xl border-r z-50 bg-background" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={handleCloseView}>
								{selectedVenue && (
									<div className="flex flex-col h-full">
										{/* Drawer Header */}
										<div className="p-6 pb-2">
											<div className="flex items-center justify-between mb-2">
												<Badge variant="outline" className="text-xs">Location Details</Badge>
												<Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCloseView}>
													<X className="h-4 w-4" />
												</Button>
											</div>
											<SheetTitle className="text-xl font-bold leading-tight">{selectedVenue.name}</SheetTitle>
											<SheetDescription className="flex items-center gap-1 mt-2 text-xs">
												<MapPin className="h-3 w-3" />
												{selectedVenue.latitude.toFixed(4)}, {selectedVenue.longitude.toFixed(4)}
											</SheetDescription>
										</div>
										
										<Separator />
			
										<ScrollArea className="flex-1">
											<div className="p-6 space-y-6">
												{/* 1. Events Section */}
												<div>
													<h3 className="font-semibold flex items-center gap-2 mb-3">
														<Calendar className="h-4 w-4 text-primary" /> 
														Events ({selectedVenue.events?.length || 0})
													</h3>
													<div className="space-y-4">
														{/* Events Mapping */}
														{selectedVenue.events && selectedVenue.events.length > 0 ? (
															selectedVenue.events.map((event, idx) => (
																<div key={idx} className="bg-white p-4 rounded-lg border shadow-sm text-sm">
																	
																	{/* Event Title */}
																	<div className="font-bold text-base text-blue-700 mb-1">
																		{event.title || "Event Title"}
																	</div>
																	
																	{/* Presenter */}
																	<div className="text-xs text-muted-foreground mb-3">
																		Presented by {event.presentor || "Organizer"}
																	</div>

																	{/* Description - Using Helper Component */}
																	<EventDescription text={event.description} />

																	{/* Sessions List - Using Helper Component */}
																	<EventSessions dateString={event.dateTime} />

																</div>
															))
														) : (
															<div className="text-sm text-muted-foreground italic">No events found.</div>
														)}
													</div>
												</div>
			
												<Separator />
			
												{/* 2. Comments Section */}
												<div>
													<h3 className="font-semibold flex items-center gap-2 mb-3">
														<MessageSquare className="h-4 w-4 text-primary" /> 
														Comments
													</h3>
													<div className="space-y-4">
														{/* Comment List */}
														<div className="space-y-3">
															{comments.map((c, i) => (
																<div key={i} className="text-sm">
																	<div className="flex justify-between items-baseline">
																		<span className="font-semibold text-xs">{c.user}</span>
																		<span className="text-[10px] text-muted-foreground">{c.date}</span>
																	</div>
																	<p className="text-muted-foreground mt-0.5">{c.text}</p>
																</div>
															))}
														</div>
														
														{/* Add Comment Input */}
														<div className="flex gap-2 pt-2">
															<input 
																className="flex-1 bg-background border rounded-md px-3 py-2 text-xs"
																placeholder="Write a comment..."
																value={newComment}
																onChange={(e) => setNewComment(e.target.value)}
															/>
															<Button size="icon" className="h-8 w-8" onClick={handleAddComment}>
																<Send className="h-3 w-3" />
															</Button>
														</div>
													</div>
												</div>
											</div>
										</ScrollArea>
									</div>
								)}
							</SheetContent>
						</Sheet>
		</div>
	);
}

// --- Helper: Smart Parse for Sessions ---
// ------------------------------------------------------------------
// HELPER FUNCTIONS
// ------------------------------------------------------------------

// --- Helper: Smart Parse for Sessions ---
function parseSessionString(str) {
    if (!str) return [];
    
    // 1. Normalize Separators:
    // Replace "---", ";", and newlines with commas for unified splitting
    let normalizedStr = str.replace(/---|;|\n/g, ',');

    // 2. Initial split by comma (ignoring parentheses)
    const rawSegments = [];
    let depth = 0;
    let current = "";
    for (let i = 0; i < normalizedStr.length; i++) {
        const char = normalizedStr[i];
        if (char === '(') depth++;
        if (char === ')') depth--;
        
        // Split at comma only if we are at depth 0 (outside parens)
        if (char === ',' && depth === 0) {
            if (current.trim()) rawSegments.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }
    // Push the last segment
    if (current.trim()) rawSegments.push(current.trim());

    // 3. Post-processing to merge "orphan" times and "Except" clauses
    const mergedSessions = [];
    
    // Regex for Month Names (Jan...Dec) OR numeric dates (19/12, 1/1)
    const dateRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)|(\d{1,2}\/\d{1,2})/i;

    rawSegments.forEach((segment) => {
        const cleanSeg = segment.trim();
        const hasDate = dateRegex.test(cleanSeg);
        const startsWithExcept = /^except/i.test(cleanSeg);
        
        // Check if the PREVIOUS session line is currently "open" with an exception clause
        // (i.e., it contains the word "Except")
        const prevSessionIndex = mergedSessions.length - 1;
        const prevHasExcept = prevSessionIndex >= 0 && /except/i.test(mergedSessions[prevSessionIndex]);
        
        // Check if current segment looks like a distinct new session (usually has parens like "(Mon)")
        const hasParens = /\(/.test(cleanSeg);

        if (mergedSessions.length === 0) {
            mergedSessions.push(cleanSeg);
        } else if (startsWithExcept) {
            // Case A: Segment starts with "Except" -> Always merge to previous
            mergedSessions[prevSessionIndex] += `; ${cleanSeg}`;
        } else if (hasDate) {
            // Case B: It has a date. Usually a new session...
            // UNLESS it is part of an ongoing Exception list (e.g. "8 Dec" after "Except 1 Dec")
            // and it doesn't look like a full session definition (no parens).
            if (prevHasExcept && !hasParens) {
                mergedSessions[prevSessionIndex] += `, ${cleanSeg}`;
            } else {
                mergedSessions.push(cleanSeg);
            }
        } else {
            // Case C: No date (e.g. "7:00pm") -> Merge to previous
            mergedSessions[prevSessionIndex] += `, ${cleanSeg}`;
        }
    });

    return mergedSessions;
}

// --- Helper Component: Expandable Description ---
function EventDescription({ text }) {
    const [isExpanded, setIsExpanded] = useState(false);
    if (!text) return null;

    const showButton = text.length > 100; 

    return (
        <div className="mb-3">
            <div className={`text-sm text-gray-700 leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}>
                {text}
            </div>
            {showButton && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs text-blue-600 font-medium mt-1 hover:underline focus:outline-none"
                >
                    {isExpanded ? "Show less" : "More details"}
                </button>
            )}
        </div>
    );
}

// --- Helper Component: Expandable Sessions ---
function EventSessions({ dateString }) {
    const [isExpanded, setIsExpanded] = useState(false);
    
    if (!dateString) return <div className="text-xs text-muted-foreground">Date TBA</div>;
    
    const sessions = parseSessionString(dateString);
    if (sessions.length === 0) return null;

    const firstSession = sessions[0];
    const restSessions = sessions.slice(1);
    const hasMore = restSessions.length > 0;

    return (
        <div className="space-y-3 pt-2 border-t border-dashed">
            <span className="text-xs font-semibold text-gray-900 block">Event Sessions:</span>
            
            {/* Always show the first session */}
            <div className="flex flex-col">
                <div className="font-medium text-gray-800 flex items-start gap-2">
                    <span className="text-xs mt-0.5">📅</span>
                    <span>{firstSession}</span>
                </div>
            </div>

            {/* Toggle logic for remaining sessions */}
            {hasMore && (
                <>
                    {isExpanded && restSessions.map((session, idx) => (
                        <div key={idx} className="flex flex-col animate-in fade-in slide-in-from-top-1 duration-200">
                             <div className="font-medium text-gray-800 flex items-start gap-2">
                                <span className="text-xs mt-0.5">📅</span>
                                <span>{session}</span>
                            </div>
                        </div>
                    ))}

                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1 mt-1"
                    >
                        {isExpanded ? "Show less" : `View ${restSessions.length} more session(s)`}
                    </button>
                </>
            )}
        </div>
    );
}

export default HomePage;
