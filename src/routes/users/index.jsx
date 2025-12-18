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
import { getAllUsers, deleteUser, updateUser, createUser } from "../../services/users";
import { useLanguage } from "@/hooks/LanguageContext";

export const Route = createFileRoute("/users/")({
	component: UsersPage,
});

function UsersPage() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [editingUser, setEditingUser] = useState(null);
	const [deletingUser, setDeletingUser] = useState(null);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [error, setError] = useState(null);
	const [sorting, setSorting] = useState([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [lastUpdated, setLastUpdated] = useState(null);
	const { t, language } = useLanguage();
	const currentLocale = language === "zh" ? "zh-HK" : "en-US";

	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
		role: "user",
	});

	const showError = (title, error) => {
		setError({ title, description: error.response?.data?.message || "An unexpected error occurred" });
		setTimeout(() => setError(null), 5000);
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		try {
			const data = await getAllUsers();
			setUsers(data);
			setLastUpdated(new Date());
		} catch (error) {
			showError("Failed to fetch users", error);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!deletingUser) return;
		try {
			await deleteUser(deletingUser._id);
			setUsers(users.filter((user) => user._id !== deletingUser._id));
		} catch (error) {
			showError("Failed to delete user", error);
		} finally {
			setIsDeleteDialogOpen(false);
			setDeletingUser(null);
		}
	};

	const handleEditClick = (user) => {
		setEditingUser(user);
		setFormData({
			username: user.username,
			email: user.email,
			password: "",
			role: user.role,
		});
		setIsEditDialogOpen(true);
	};

	const handleCreateClick = () => {
		setEditingUser(null);
		setFormData({
			username: "",
			email: "",
			password: "",
			role: "user",
		});
		setIsEditDialogOpen(true);
	};

	const handleSave = async () => {
		try {
			const payload = { ...formData };
			if (!payload.password) delete payload.password;

			if (editingUser) {
				const updatedUser = await updateUser(editingUser._id, payload);
				setUsers(users.map((u) => (u._id === updatedUser._id ? updatedUser : u)));
			} else {
				const newUser = await createUser(payload);
				setUsers([newUser, ...users]);
			}
			setIsEditDialogOpen(false);
			setEditingUser(null);
			setFormData({
				username: "",
				email: "",
				password: "",
				role: "user",
			});
		} catch (error) {
			showError("Failed to save user", error);
		}
	};
	const handleCloseDialog = () => {
		setIsEditDialogOpen(false);
		setEditingUser(null);
		setFormData({
			username: "",
			email: "",
			password: "",
			role: "user",
		});
	};

	const columns = [
		{
			accessorKey: "username",
			header: ({ column }) => {
				return (
					<div className="flex items-center">
						{t("users.tableUsername")}
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
		},
		{
			accessorKey: "email",
			header: ({ column }) => {
				return (
					<div className="flex items-center">
						{t("users.tableEmail")}
						<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
							<ArrowUpDown />
						</Button>
					</div>
				);
			},
		},
		{
			accessorKey: "role",
			header: t("users.tableRole"),
			cell: ({ row }) => {
				const roleValue = row.getValue("role");
				const displayRole = roleValue === "admin" ? t("users.roleAdmin") : t("users.roleUser");
				return <div className="capitalize">{displayRole}</div>;
			},
		},
		{
			id: "actions",
			header: t("users.tableActions"),
			cell: ({ row }) => {
				const user = row.original;
				return (
					<div className="flex gap-2">
						<Button size="sm" onClick={() => handleEditClick(user)}>
							<Pencil /> {t("users.btnUpdate")}
						</Button>
						<Button
							size="sm"
							variant="destructive"
							onClick={() => {
								setDeletingUser(user);
								setIsDeleteDialogOpen(true);
							}}
						>
							<Trash2 /> {t("users.btnDelete")}
						</Button>
					</div>
				);
			},
		},
	];

	const table = useReactTable({
		data: users,
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

	if (loading) return <div className="p-8">{t("users.loading")}</div>;

	return (
		<div className="flex flex-col py-6 px-4 sm:px-8 gap-4">
			<header className="flex flex-col gap-2">
				<h1 className="text-3xl font-semibold">{t("users.title")}</h1>
				<p className="text-sm text-muted-foreground">{t("users.subtitle")}</p>
			</header>

			{/* User Table */}
			<div>
				{/* Top Bar: New User Button, Search, Last Updated, Pagination */}
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between py-4 gap-4">
					{/* Left: New User + Search */}
					<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
						<Button onClick={handleCreateClick} className="w-full sm:w-auto">
							<Plus /> {t("users.btnNew")}
						</Button>

						<Input
							value={table.getState().globalFilter ?? ""}
							onChange={(e) => table.setGlobalFilter(String(e.target.value))}
							placeholder={t("users.searchPlaceholder")}
							className="w-full sm:w-64"
						/>
					</div>

					{/* Center: Last Updated - Hidden on mobile */}
					<div className="hidden lg:flex items-center text-sm text-muted-foreground">
						{lastUpdated && (
							<span>
								{t("users.lastUpdated")} {lastUpdated.toLocaleDateString(currentLocale)} {t("users.at")}{" "}
								{lastUpdated.toLocaleTimeString(currentLocale)}
							</span>
						)}
					</div>

					{/* Right: Pagination - Hidden on mobile, shown in separate section */}
					<div className="hidden md:flex items-center space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							{t("users.btnPrev")}
						</Button>
						<span className="text-sm text-muted-foreground">
							{t("users.page")} {table.getState().pagination.pageIndex + 1} {t("users.of")} {table.getPageCount()}
						</span>
						<Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
							{t("users.btnNext")}
						</Button>
					</div>
				</div>
				{/* Mobile Card Layout */}
				<div className="grid grid-cols-1 gap-4 md:hidden mb-6">
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => {
							const user = row.original;
							const displayRole = user.role === "admin" ? t("users.roleAdmin") : t("users.roleUser");

							return (
								<div
									key={user._id}
									className="rounded-lg border p-4 shadow-sm bg-card hover:bg-muted/50 transition-colors"
								>
									<div className="flex justify-between items-start mb-3">
										<div className="flex-1">
											<h3 className="font-bold text-base">{user.username}</h3>
											<p className="text-sm text-muted-foreground mt-1">{user.email || "No email"}</p>
										</div>
										<div className="ml-2">
											<span
												className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
													user.role === "admin"
														? "bg-primary/10 text-primary"
														: "bg-secondary text-secondary-foreground"
												}`}
											>
												{displayRole}
											</span>
										</div>
									</div>
									<div className="flex gap-2 mt-3">
										<Button size="sm" onClick={() => handleEditClick(user)} className="flex-1">
											<Pencil className="h-3 w-3 mr-1" />
											{t("users.btnUpdate")}
										</Button>
										<Button
											size="sm"
											variant="destructive"
											onClick={() => {
												setDeletingUser(user);
												setIsDeleteDialogOpen(true);
											}}
											className="flex-1"
										>
											<Trash2 className="h-3 w-3 mr-1" />
											{t("users.btnDelete")}
										</Button>
									</div>
								</div>
							);
						})
					) : (
						<div className="text-center py-12 text-muted-foreground">{t("users.noResults")}</div>
					)}
				</div>
				{/* Mobile Pagination */}
				<div className="flex md:hidden items-center justify-center gap-2 mb-4">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						{t("users.btnPrev")}
					</Button>
					<span className="text-sm text-muted-foreground">
						{t("users.page")} {table.getState().pagination.pageIndex + 1} {t("users.of")} {table.getPageCount()}
					</span>
					<Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
						{t("users.btnNext")}
					</Button>
				</div>
				{/* Desktop Table - Hidden on mobile */}
				<div className="hidden md:block overflow-hidden rounded-md border">
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
										{t("users.noResults")}
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>
			{/* Desktop Pagination (below table) */}
			<div className="hidden md:flex items-center justify-end gap-2">
				<Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
					{t("users.btnPrev")}
				</Button>
				<span className="text-sm text-muted-foreground">
					{t("users.page")} {table.getState().pagination.pageIndex + 1} {t("users.of")} {table.getPageCount()}
				</span>
				<Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
					{t("users.btnNext")}
				</Button>
			</div>
			{/* Add/Edit User Dialog */}
			<AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<AlertDialogContent className="w-full max-w-2xl">
					<AlertDialogHeader>
						<AlertDialogTitle>{editingUser ? t("users.dlgEditTitle") : t("users.dlgCreateTitle")}</AlertDialogTitle>
						<AlertDialogDescription>
							{editingUser ? t("users.dlgEditDesc") : t("users.dlgCreateDesc")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="username" className="text-right">
								{t("users.lblUsername")}
							</Label>
							<Input
								id="username"
								value={formData.username}
								onChange={(e) => setFormData({ ...formData, username: e.target.value })}
								className="col-span-3"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="email" className="text-right">
								{t("users.lblEmail")}
							</Label>
							<Input
								id="email"
								type="email"
								value={formData.email}
								onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								className="col-span-3"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="password" className="text-right">
								{t("users.lblPassword")}
							</Label>
							<Input
								id="password"
								type="password"
								placeholder={editingUser ? t("users.phPasswordKeep") : ""}
								value={formData.password}
								onChange={(e) =>
									setFormData({
										...formData,
										password: e.target.value,
									})
								}
								className="col-span-3"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="role" className="text-right">
								{t("users.lblRole")}
							</Label>
							<Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
								<SelectTrigger className="col-span-3">
									<SelectValue placeholder="Select a role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="user">{t("users.roleUser")}</SelectItem>
									<SelectItem value="admin">{t("users.roleAdmin")}</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<AlertDialogFooter>
						<Button variant="outline" onClick={handleCloseDialog}>
							{t("users.btnCancel")}
						</Button>
						<Button onClick={handleSave}>{t("users.btnSave")}</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Delete User Dialog */}
			<AlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={(value) => {
					if (!value) {
						setDeletingUser(null);
					}
					setIsDeleteDialogOpen(value);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("users.dlgDeleteTitle")}</AlertDialogTitle>
						<AlertDialogDescription>{t("users.dlgDeleteDesc")}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
							{t("users.btnCancel")}
						</Button>
						<Button variant="destructive" onClick={handleDelete}>
							{t("users.btnConfirmDelete")}
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
