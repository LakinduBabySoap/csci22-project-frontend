import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon, Heart, MapPin, Calendar } from "lucide-react";
import { getFavoriteVenues, removeFavoriteVenue } from "@/services/venues";

export const Route = createFileRoute("/profile/")({
    component: ProfilePage,
});

function ProfilePage() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const showError = (title, error) => {
        setError({ title, description: error.response?.data?.message || "An unexpected error occurred" });
        setTimeout(() => setError(null), 5000);
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            const data = await getFavoriteVenues();
            setFavorites(data);
        } catch (error) {
            showError("Failed to fetch favorites", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (venueId) => {
        try {
            await removeFavoriteVenue(venueId);
            setFavorites(favorites.filter((venue) => venue._id !== venueId));
        } catch (error) {
            showError("Failed to remove favorite", error);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="flex flex-col py-6 px-4 sm:px-8 gap-4">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-semibold">My Favorite Venues</h1>
                <p className="text-sm text-muted-foreground">Manage your saved cultural venues and locations.</p>
            </header>

            {favorites.length === 0 ? (
                <Card className="mt-8">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
                        <CardTitle className="mb-2">No favorite venues yet</CardTitle>
                        <CardDescription>Start exploring and add venues to your favorites!</CardDescription>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {favorites.map((venue) => (
                        <Card key={venue._id} className="overflow-hidden">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="line-clamp-2">{venue.name}</CardTitle>
                                        <CardDescription className="mt-2 flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {venue.latitude?.toFixed(4)}, {venue.longitude?.toFixed(4)}
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveFavorite(venue._id)}
                                        className="shrink-0"
                                    >
                                        <Heart className="h-5 w-5 fill-destructive text-destructive" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>{venue.events?.length || 0} events</span>
                                </div>
                                {venue.events && venue.events.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        <p className="text-sm font-medium">Upcoming Events:</p>
                                        <ul className="space-y-1">
                                            {venue.events.slice(0, 3).map((event, idx) => (
                                                <li key={idx} className="text-sm text-muted-foreground line-clamp-1">
                                                    • {event.title}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <Alert variant="destructive" className="fixed bottom-4 right-4 z-50 w-auto">
                    <AlertCircleIcon />
                    <AlertTitle>{error.title}</AlertTitle>
                    <AlertDescription>{error.description}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}