import { Link, Outlet } from "react-router-dom";

export default function Layout() {
	return (
		<div className="flex min-h-screen">
			{/* Side Menu */}
			<aside className="w-64 bg-gray-800 text-white p-6">
				<h1 className="text-2xl font-bold mb-6">Hostel Management</h1>
				<nav className="space-y-3">
					<Link to="/" className="block hover:bg-gray-700 p-2 rounded">
						Dashboard
					</Link>
					<Link to="/complaint" className="block hover:bg-gray-700 p-2 rounded">
						Complaints
					</Link>
					<Link
						to="/notifications"
						className="block hover:bg-gray-700 p-2 rounded">
						Notifications
					</Link>
					<Link
						to="/room-change"
						className="block hover:bg-gray-700 p-2 rounded">
						Room Change
					</Link>
				</nav>
			</aside>

			{/* Main Content */}
			<main className="flex-1 p-8 bg-gray-100">
				<Outlet />
			</main>
		</div>
	);
}
