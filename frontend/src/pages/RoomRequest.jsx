import { useState } from "react";

export default function RoomRequest() {
	const [currentRoom, setCurrentRoom] = useState("");
	const [requestedRoom, setRequestedRoom] = useState("");
	const [reason, setReason] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		alert(
			`Request submitted:\nCurrent Room: ${currentRoom}\nRequested Room: ${requestedRoom}\nReason: ${reason}`
		);
		// Later: Replace alert with API call
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
			<form
				onSubmit={handleSubmit}
				className="bg-white p-8 rounded shadow-md w-full max-w-md">
				<h1 className="text-2xl font-bold mb-6">
					Room Change / Exchange Request
				</h1>

				<input
					type="text"
					placeholder="Current Room"
					value={currentRoom}
					onChange={(e) => setCurrentRoom(e.target.value)}
					className="w-full p-3 mb-4 border border-gray-300 rounded"
				/>

				<input
					type="text"
					placeholder="Requested Room"
					value={requestedRoom}
					onChange={(e) => setRequestedRoom(e.target.value)}
					className="w-full p-3 mb-4 border border-gray-300 rounded"
				/>

				<textarea
					placeholder="Reason for change/exchange"
					value={reason}
					onChange={(e) => setReason(e.target.value)}
					className="w-full p-3 mb-4 border border-gray-300 rounded"
				/>

				<button
					type="submit"
					className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700">
					Submit Request
				</button>
			</form>
		</div>
	);
}
