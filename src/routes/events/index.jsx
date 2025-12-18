import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Pencil, Trash2, ArrowUpDown, AlertCircleIcon, Plus } from "lucide-react";
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { getAllEvents, deleteEvent, updateEvent, createEvent } from "@/services/events";
import { getAllVenues } from "@/services/venues";
import ReactSelect from "react-select";
import { useLanguage } from "@/hooks/LanguageContext";

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
	const { t, resolve, language } = useLanguage(); 
    const currentLocale = language === 'zh' ? 'zh-HK' : 'en-US';

	const smartResolve = (obj, fieldEn, fieldZh) => {
        if (!obj) return "";
        const valEn = obj[fieldEn];
        const valZh = obj[fieldZh];

        // Define what constitutes "valid" data (excludes "--" and empty strings)
        const isValid = (v) => v && v !== "--" && v.trim() !== "";

        if (language === 'zh') {
            // Try Chinese -> Fallback to English -> Fallback to raw Chinese (even if --) -> Fallback to raw English
            if (isValid(valZh)) return valZh;
            if (isValid(valEn)) return valEn;
            return valZh || valEn || "";
        } else {
            // Try English -> Fallback to Chinese -> Fallback to raw English -> Fallback to raw Chinese
            if (isValid(valEn)) return valEn;
            if (isValid(valZh)) return valZh;
            return valEn || valZh || "";
        }
    };

	const [formData, setFormData] = useState({
		title: "",
		venue: "",
		dateTime: "",
		description: "",
		presentor: "",
		price: "",
	});

	const venueOptions = venues.map((venue) => ({
		value: venue._id,
		label: resolve(venue, 'name'),
	}));

	const showError = (title, error) => {
		setError({ title, description: error.response?.data?.message || "An unexpected error occurred" });
		setTimeout(() => setError(null), 5000);
	};

	useEffect(() => {
		fetchEvents();
	}, []);

	const fetchEvents = async () => {
		try {
			const [eventsData, venuesData] = await Promise.all([getAllEvents(), getAllVenues()]);
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
		setEditingEvent(event);
		setFormData({
			title: event.title || "",
			venue: typeof event.venue === "string" ? event.venue : event.venue?._id || "",
			dateTime: event.dateTime || "",
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
			dateTime: "",
			description: "",
			presentor: "",
			price: "",
		});
		setIsEditDialogOpen(true);
	};
	const handleSave = async () => {
		if (!formData.title || !formData.venue || !formData.dateTime) {
			showError(t('events.errValidation'), { message: t('events.errReqFields') });
			return;
		}

		try {
			const payload = {
				title: formData.title,
				venue: formData.venue,
				dateTime: formData.dateTime,
				description: formData.description || "",
				presentor: formData.presentor || "",
				price: formData.price || "",
			};

			if (editingEvent) {
				const updatedEvent = await updateEvent(editingEvent._id, payload);
				setEvents(
					events.map((e) =>
						e._id === updatedEvent._id
							? {
									...updatedEvent,
									venue: venues.find((v) => v._id === updatedEvent.venue) || updatedEvent.venue,
								}
							: e
					)
				);
			} else {
				const newEvent = await createEvent(payload);
				setEvents([
					{
						...newEvent,
						venue: venues.find((v) => v._id === newEvent.venue) || newEvent.venue,
					},
					...events,
				]);
			}

			setIsEditDialogOpen(false);
			setEditingEvent(null);
			setFormData({
				title: "",
				venue: "",
				dateTime: "",
				description: "",
				presentor: "",
				price: "",
			});
			setLastUpdated(new Date());
		} catch (error) {
			showError(t('events.errSave'), error);
		}
	};

	const handleCloseDialog = () => {
		setIsEditDialogOpen(false);
		setEditingEvent(null);
		setFormData({
			title: "",
			venue: "",
			dateTime: "",
			description: "",
			presentor: "",
			price: "",
		});
	};
	const columns = [
		{
			id: "title",
			accessorFn: (row) => smartResolve(row, 'title', 'titleChinese'),
			header: ({ column }) => {
				return (
					<div className="flex items-center">
						{t('events.colTitle')}
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
			cell: ({ row }) => <div className="max-w-[250px] whitespace-normal break-words">{smartResolve(row.original, 'title', 'titleChinese') || t('events.na')}</div>,
		},
		{
			id: "description",
            header: t('events.colDesc'),
            accessorFn: (row) => smartResolve(row, 'description', 'descriptionChinese'),
			cell: ({ row }) => {
				const description = smartResolve(row.original, 'description', 'descriptionChinese');
				if (!description) return <span className="text-muted-foreground text-sm">{t('events.noDesc')}</span>;

				return (
					<div className="max-w-[300px] text-sm line-clamp-2" title={description}>
						{description}
					</div>
				);
			},
		},
		{
            id: "venue",
        accessorFn: (row) => {
             const venue = row.venue;
             return typeof venue === "string" ? venue : smartResolve(venue, 'name', 'nameChinese');
        },
            header: t('events.colVenue'),
            cell: ({ row }) => {
                const venue = row.original.venue;
                const venueName = typeof venue === "string" ? venue : smartResolve(venue, 'name', 'nameChinese') || t('events.na');
                return <div className="max-w-[180px] whitespace-normal break-words">{venueName}</div>;
            },
        },
		{
			accessorKey: "price",
			header: t('events.colPrice'),
			cell: ({ row }) => (
				<div className="max-w-[80px] whitespace-normal break-words text-sm">{resolve(row.original, 'price') || t('events.free')}</div>
			),
		},
		{
			id: "presentor",
            header: t('events.colPresenter'),
            accessorFn: (row) => smartResolve(row, 'presentor', 'presenterChinese'),
			cell: ({ row }) => (
				<div className="max-w-[150px] whitespace-normal break-words text-sm">{smartResolve(row.original, 'presentor', 'presenterChinese') || t('events.na')}</div>
			),
		},
		{
			accessorKey: "dateTime",
			header: ({ column }) => {
				return (
					<div className="flex items-center">
						{t('events.colDate')}
						<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
							<ArrowUpDown />
						</Button>
					</div>
				);
			},
			cell: ({ row }) => {
				const dateTime = smartResolve(row.original, 'dateTime', 'dateTimeChinese');
				if (!dateTime) t('events.na');
				const date = new Date(dateTime);

				if (isNaN(date.getTime())) {
					// For invalid/raw date strings, wrap normally (no truncation)
					return <div className="max-w-[120px] text-xs whitespace-normal break-words">{dateTime}</div>;
				}

				// For valid dates, format compactly on two lines
				return (
					<div className="max-w-[120px] text-xs whitespace-nowrap">
						<span className="block">{date.toLocaleDateString(currentLocale)}</span>
						<span className="block text-muted-foreground">
							{date.toLocaleTimeString(currentLocale, { hour: "2-digit", minute: "2-digit" })}
						</span>
					</div>
				);
			},
		},
		{
			id: "actions",
			header: t('events.colActions'),
			cell: ({ row }) => {
				const event = row.original;
				return (
					<div className="flex gap-2 whitespace-nowrap">
						<Button size="sm" onClick={() => handleEditClick(event)}>
							<Pencil className="h-4 w-4" />
							<span className="ml-1">{t('events.btnUpdate')}</span>
						</Button>
						<Button
							size="sm"
							variant="destructive"
							onClick={() => {
								setDeletingEvent(event);
								setIsDeleteDialogOpen(true);
							}}
						>
							<Trash2 className="h-4 w-4" />
							<span className="ml-1">{t('events.btnDelete')}</span>
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

	if (loading) return <div className="p-8">{t('events.loading')}</div>;

	return (
		<div className="flex flex-col py-6 px-4 sm:px-8 gap-4">
			<header className="flex flex-col gap-2">
				<h1 className="text-3xl font-semibold">{t('events.title')}</h1>
				<p className="text-sm text-muted-foreground">{t('events.subtitle')}</p>
			</header>

			<div>
				<div className="flex items-center justify-between py-4 gap-4 flex-wrap">
					<Button onClick={handleCreateClick}>
						<Plus /> {t('events.btnNew')}
					</Button>

					<Input
						value={table.getState().globalFilter ?? ""}
						onChange={(e) => table.setGlobalFilter(String(e.target.value))}
						placeholder={t('events.searchPlaceholder')}
						className="max-w-xs"
					/>

					<div className="flex items-center gap-4 text-sm text-muted-foreground">
						{lastUpdated && (
							<span>
								{t('events.lastUpdated')}  {lastUpdated.toLocaleDateString(currentLocale)} {t('events.at')} {lastUpdated.toLocaleTimeString(currentLocale)}
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
							 {t('events.btnPrev')}
						</Button>
						<span className="text-sm text-muted-foreground">
							 {t('events.page')} {table.getState().pagination.pageIndex + 1} {t('events.of')} {table.getPageCount()}
						</span>
						<Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
							{t('events.btnNext')}
						</Button>
					</div>
				</div>

				<div className="overflow-hidden rounded-md border">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableHead key={header.id}>
											{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									))}
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

			<div className="flex items-center justify-end gap-2">
				<Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
					 {t('events.btnPrev')}
				</Button>
				<span className="text-sm text-muted-foreground">
					  {t('events.page')} {table.getState().pagination.pageIndex + 1} {t('events.of')} {table.getPageCount()}
				</span>
				<Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
					  {t('events.btnNext')}
				</Button>
			</div>

			{/* Add/Edit Event Dialog */}
			<AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<AlertDialogContent className="w-full max-w-2xl">
					<AlertDialogHeader>
						<AlertDialogTitle>{editingEvent ? t('events.dlgEditTitle') : t('events.dlgCreateTitle')}</AlertDialogTitle>
						<AlertDialogDescription>
							 {editingEvent ? t('events.dlgEditDesc') : t('events.dlgCreateDesc')}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="title" className="text-right">
								{t('events.lblTitle')} <span className="text-destructive">*</span>
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
								  {t('events.lblVenue')} <span className="text-destructive">*</span>
							</Label>
							<div className="col-span-3">
								<ReactSelect
									id="venue"
									options={venueOptions}
									value={venueOptions.find((option) => option.value === formData.venue) || null}
									onChange={(selectedOption) => {
										setFormData({ ...formData, venue: selectedOption?.value || "" });
									}}
									placeholder={t('events.phVenueSearch')}
									isClearable
									isSearchable
									className="text-sm"
									classNamePrefix="react-select"
									filterOption={(option, inputValue) => {
										if (!inputValue || inputValue.length < 2) return false;
										return option.label.toLowerCase().includes(inputValue.toLowerCase());
									}}
									noOptionsMessage={({ inputValue }) => {
										if (!inputValue || inputValue.length < 2) {
											return t('events.phVenueType');;
										}
										return t('events.phVenueNo');;
									}}
									maxMenuHeight={300}
									styles={{
										menu: (base) => ({
											...base,
											maxHeight: "300px",
											zIndex: 9999,
										}),
									}}
								/>
							</div>
						</div>

						<div className="grid grid-cols-4 items-start gap-4">
							<Label htmlFor="dateTime" className="text-right pt-2">
								 {t('events.lblDate')}  <span className="text-destructive">*</span>
							</Label>
							<textarea
								id="dateTime"
								value={formData.dateTime}
								onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
								placeholder={t('events.phDate')}
								className="col-span-3 min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
							/>
						</div>

						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="price" className="text-right">
								 {t('events.lblPrice')}
							</Label>
							<Input
								id="price"
								value={formData.price}
								placeholder={t('events.phPrice')}
								onChange={(e) => setFormData({ ...formData, price: e.target.value })}
								className="col-span-3"
							/>
						</div>

						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="presenter" className="text-right">
								 {t('events.lblPresenter')}
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
								 {t('events.lblDesc')}
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
							{t('events.btnCancel')}
						</Button>
						<Button onClick={handleSave}>{t('events.btnSave')}</Button>
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
						<AlertDialogTitle>{t('events.dlgDeleteTitle')}</AlertDialogTitle>
						<AlertDialogDescription>{t('events.dlgDeleteDesc')}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
							 {t('events.btnCancel')}
						</Button>
						<Button variant="destructive" onClick={handleDelete}>
							{t('events.btnDelete')}
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
