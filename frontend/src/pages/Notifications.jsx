export default function Notifications() {
	// Dummy notifications
	const notifications = [
		{ id: 1, message: "Room change approved", status: "Approved" },
		{ id: 2, message: "Complaint #23 is being processed", status: "Pending" },
		{ id: 3, message: "New hostel rules updated", status: "Info" },
	];

	return (
		<div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
			<h1 className="text-2xl font-bold mb-6">Notifications & Status</h1>
			<ul className="space-y-4">
				{notifications.map((note) => (
					<li
						key={note.id}
						className="p-4 border border-gray-300 rounded flex justify-between items-center">
						<span>{note.message}</span>
						<span
							className={`px-2 py-1 rounded text-white ${
								note.status === "Approved"
									? "bg-green-500"
									: note.status === "Pending"
									? "bg-yellow-500"
									: "bg-blue-500"
							}`}>
							{note.status}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}
