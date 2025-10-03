import { useState } from "react";

export default function WardenDashboard() {
	const [activeMenu, setActiveMenu] = useState("Dashboard");

	const menuItems = [
		"Dashboard",
		"Room Requests",
		"Complaints",
		"Notifications",
	];

	return (
		<div className="flex min-h-screen bg-gray-100">
			{/* Side Menu */}
			<aside className="w-64 bg-white shadow-md">
				<h2 className="text-2xl font-bold p-6">Warden Panel</h2>
				<ul>
					{menuItems.map((item) => (
						<li
							key={item}
							className={`p-4 cursor-pointer hover:bg-gray-200 ${
								activeMenu === item ? "bg-gray-200 font-bold" : ""
							}`}
							onClick={() => setActiveMenu(item)}>
							{item}
						</li>
					))}
				</ul>
			</aside>

			{/* Main Content */}
			<main className="flex-1 p-8">
				<nav className="mb-8 bg-white p-4 rounded shadow">
					<h1 className="text-xl font-bold">{activeMenu}</h1>
				</nav>

				<div className="bg-white p-6 rounded shadow">
					<p>This is the {activeMenu} section.</p>
					{/* Later: Render actual content here based on menu selection */}
				</div>
			</main>
		</div>
	);
}
