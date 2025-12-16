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
						Username
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
						Email
						<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
							<ArrowUpDown />
						</Button>
					</div>
				);
			},
		},
		{
			accessorKey: "role",
			header: "Role",
			cell: ({ row }) => <div className="capitalize">{row.getValue("role")}</div>,
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const user = row.original;
				return (
					<div className="flex gap-2">
						<Button size="sm" onClick={() => handleEditClick(user)}>
							<Pencil /> Update
						</Button>
						<Button
							size="sm"
							variant="destructive"
							onClick={() => {
								setDeletingUser(user);
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

	if (loading) return <div className="p-8">Loading...</div>;

	return (
		<div className="flex flex-col py-6 px-4 sm:px-8 gap-4">
			<header className="flex flex-col gap-2">
				<h1 className="text-3xl font-semibold">User Management</h1>
				<p className="text-sm text-muted-foreground">Manage accounts, roles, and credentials.</p>
			</header>

			{/* User Table */}
			<div>
				{/* Top Bar: New User Button, Search, Last Updated, Pagination */}
				{/* Top Bar: New User Button, Search, Last Updated, Pagination */}
				<div className="flex items-center justify-between py-4 gap-4">
					{/* Left: New User + Search */}
					<div className="flex items-center gap-4">
						<Button onClick={handleCreateClick}>
							<Plus /> New User
						</Button>

						<Input
							value={table.getState().globalFilter ?? ""}
							onChange={(e) => table.setGlobalFilter(String(e.target.value))}
							placeholder="Search users by username"
							className="w-64"
						/>
					</div>

					{/* Center: Last Updated */}
					<div className="flex items-center text-sm text-muted-foreground">
						{lastUpdated && (
							<span>
								Last updated on {lastUpdated.toLocaleDateString()} at {lastUpdated.toLocaleTimeString()}
							</span>
						)}
					</div>

					{/* Right: Pagination */}
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
			<div className="flex items-center justify-end gap-2">
				<Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
					Previous
				</Button>
				<span className="text-sm text-muted-foreground">
					Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
				</span>
				<Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
					Next
				</Button>
			</div>

			{/* Add/Edit User Dialog */}
			<AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<AlertDialogContent className="w-full max-w-2xl">
					<AlertDialogHeader>
						<AlertDialogTitle>{editingUser ? "Edit User" : "Create User"}</AlertDialogTitle>
						<AlertDialogDescription>
							{editingUser ? "Update profile data and credentials." : "Add a new user to the database."}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="username" className="text-right">
								Username
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
								Email
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
								Password
							</Label>
							<Input
								id="password"
								type="password"
								placeholder={editingUser ? "Leave blank to keep current password" : ""}
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
								Role
							</Label>
							<Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
								<SelectTrigger className="col-span-3">
									<SelectValue placeholder="Select a role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="user">User</SelectItem>
									<SelectItem value="admin">Admin</SelectItem>
								</SelectContent>
							</Select>
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
						<AlertDialogTitle>Confirm delete</AlertDialogTitle>
						<AlertDialogDescription>Deleting a user is permanent. This cannot be undone.</AlertDialogDescription>
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
