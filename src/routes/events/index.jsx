import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Pencil, Trash2, ArrowUpDown, AlertCircleIcon, Plus } from "lucide-react";
import { getAllEvents, deleteEvent, updateEvent, createEvent } from "@/services/events";
import { getAllVenues } from "@/services/venues";
export const Route = createFileRoute("/events/")({
    component: EventsPage,
});

function EventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingEvent, setEditingEvent] = useState(null);
    const [deletingEvent, setDeletingEvent] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [error, setError] = useState(null);
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);
    const [venues, setVenues] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        venue: "",
        date: "",
        time: "",
        description: "",
        presentor: "",
        price: "",
    });

    const showError = (title, error) => {
        setError({ title, description: error.response?.data?.message || "An unexpected error occurred" });
        setTimeout(() => setError(null), 5000);
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const [eventsData, venuesData] = await Promise.all([
               getAllEvents(),
               getAllVenues()
            ]);
            setEvents(eventsData);
            setVenues(venuesData);
            setLastUpdated(new Date());
        } catch (error) {
            showError("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingEvent) return;
        try {
            await deleteEvent(deletingEvent._id);
            setEvents(events.filter((event) => event._id !== deletingEvent._id));
        } catch (error) {
            showError("Failed to delete event", error);
        } finally {
            setIsDeleteDialogOpen(false);
            setDeletingEvent(null);
        }
    };

    const handleEditClick = (event) => {
            let date = "";
        let time = "";
        if (event.dateTime) {
            const dateObj = new Date(event.dateTime);
            if (!isNaN(dateObj.getTime())) {
                date = dateObj.toISOString().split('T')[0];
                time = dateObj.toTimeString().slice(0, 5);
            }
        }
        setEditingEvent(event);
        setFormData({
            title: event.title || "",
            venue: typeof event.venue === 'string' ? event.venue : event.venue?._id || "",
            date: date,
            time: time,
            description: event.description || "",
            presentor: event.presentor || "",
            price: event.price || "",
        });
        setIsEditDialogOpen(true);
    };

    const handleCreateClick = () => {
        setEditingEvent(null);
        setFormData({
            title: "",
            venue: "",
            date: "",
            time: "",
            description: "",
            presentor: "",
            price: "",
        });
        setIsEditDialogOpen(true);
    };

    const handleSave = async () => {
         if (!formData.title || !formData.venue || !formData.date) {
            showError("Validation Error", { message: "Title, Venue, and Date are required" });
            return;
        }


        try {
                     let dateTime = formData.date;
            if (formData.time) {
                dateTime = `${formData.date}T${formData.time}:00`;
            }
            const payload = {
                title: formData.title,
                venue: formData.venue, // Should be MongoDB ObjectId
                dateTime: dateTime,
                description: formData.description || "",
                presentor: formData.presentor || "", // Match backend typo
                price: formData.price || "",
            };
            if (editingEvent) {
                const updatedEvent = await updateEvent(editingEvent._id, payload);
                setEvents(events.map((e) => (e._id === updatedEvent._id ? updatedEvent : e)));
            } else {
                const newEvent = await createEvent(payload);
                setEvents([newEvent, ...events]);
            }
            setIsEditDialogOpen(false);
            setEditingEvent(null);
            setFormData({
                title: "",
                venue: "",
                date: "",
                time: "",
                description: "",
                presentor: "",
                price: "",
            });
        } catch (error) {
            showError("Failed to save event", error);
        }
    };

    const handleCloseDialog = () => {
    setIsEditDialogOpen(false);
    setEditingEvent(null);
    setFormData({
        title: "",
        venue: "",
        date: "",
        time: "",
        description: "",
        presentor: "",
        price: "",
    });
};

    const columns = [
        {
            accessorKey: "title",
            header: ({ column }) => {
                return (
                    <div className="flex items-center">
                        Event Title
                        <Button
                            variant="ghost"
                            className="pl-0"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        >
                            <ArrowUpDown />
                        </Button>
                    </div>
                );
            },
            cell: ({ row }) => <div className="max-w-xs truncate">{row.getValue("title")}</div>,
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => <div className="max-w-xs truncate">{row.getValue("description")}</div>,
        },
        {
            accessorKey: "venue",
            header: "Venue",
            cell: ({ row }) => {
                const venue = row.getValue("venue");
                const venueName = typeof venue === 'string' ? venue : venue?.name || "N/A";
                return <div className="max-w-xs truncate">{venueName}</div>;
            },
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: ({ row }) => <div>{row.getValue("price") || "Free"}</div>,
        },
        {
            accessorKey: "presentor",
            header: "Presenters",
            cell: ({ row }) => <div className="max-w-xs truncate">{row.getValue("presentor") || "N/A"}</div>,
        },
        {
            accessorKey: "dateTime",
            header: ({ column }) => {
                return (
                    <div className="flex items-center">
                        Date & Time
                        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                            <ArrowUpDown />
                        </Button>
                    </div>
                );
            },
            cell: ({ row }) => {
                const dateTime = row.getValue("dateTime");
                if (!dateTime) return "N/A";
                const date = new Date(dateTime);
                return date.toLocaleString();
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const event = row.original;
                return (
                    <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleEditClick(event)}>
                            <Pencil /> Update
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                                setDeletingEvent(event);
                                setIsDeleteDialogOpen(true);
                            }}
                        >
                            <Trash2 /> Delete
                        </Button>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: events,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
    });

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="flex flex-col py-6 px-4 sm:px-8 gap-4">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-semibold">Event Management</h1>
                <p className="text-sm text-muted-foreground">Manage cultural events and programmes.</p>
            </header>

            {/* Events Table */}
            <div>
                {/* Top Bar: Create Button, Search, Last Updated, Pagination */}
                <div className="flex items-center justify-between py-4 gap-4 flex-wrap">
                    <Button onClick={handleCreateClick}>
                        <Plus /> New Event
                    </Button>

                    <Input
                        value={table.getState().globalFilter ?? ""}
                        onChange={(e) => table.setGlobalFilter(String(e.target.value))}
                        placeholder="Search events by title"
                        className="max-w-xs"
                    />

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {lastUpdated && (
                            <span>
                                Last updated on {lastUpdated.toLocaleDateString()} at {lastUpdated.toLocaleTimeString()}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                            Next
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Add/Edit Event Dialog */}
            <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <AlertDialogContent className="w-full max-w-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{editingEvent ? "Edit Event" : "Create Event"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {editingEvent ? "Update event information." : "Add a new cultural event to the database."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
<div className="grid grid-cols-4 items-center gap-4">
    <Label htmlFor="venue" className="text-right">
        Venue <span className="text-destructive">*</span>
    </Label>
    <Select 
        value={formData.venue} 
        onValueChange={(value) => setFormData({ ...formData, venue: value })}
    >
        <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select a venue" />
        </SelectTrigger>
        <SelectContent>
            {venues.map((venue) => (
                <SelectItem key={venue._id} value={venue._id}>
                    {venue.name}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
</div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">
                                Date
                            </Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="time" className="text-right">
                                Time
                            </Label>
                            <Input
                                id="time"
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                Price
                            </Label>
                            <Input
                                id="price"
                                value={formData.price}
                                placeholder="Leave blank for free events"
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="presenter" className="text-right">
                                Presenters
                            </Label>
                            <Input
                                id="presenter"
                                value={formData.presentor}
                                onChange={(e) => setFormData({ ...formData, presentor: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="description" className="text-right pt-2">
                                Description
                            </Label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="col-span-3 min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
<AlertDialogFooter>
    <Button variant="outline" onClick={handleCloseDialog}>
        Cancel
    </Button>
    <Button onClick={handleSave}>Save</Button>
</AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Event Dialog */}
<AlertDialog
    open={isDeleteDialogOpen}
    onOpenChange={(value) => {
        if (!value) {
            setDeletingEvent(null);
        }
        setIsDeleteDialogOpen(value);
    }}
>
    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Confirm delete</AlertDialogTitle>
            <AlertDialogDescription>Deleting an event is permanent. This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
                Delete
            </Button>
        </AlertDialogFooter>
    </AlertDialogContent>
</AlertDialog>

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