import { useState } from "react";

export default function ComplaintForm() {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("Complaint submitted:", { title, description });
		alert("Complaint submitted! (Check console for data)");
		// Later: call API to submit complaint
		setTitle("");
		setDescription("");
	};

	return (
		<div className="max-w-lg mx-auto bg-white p-8 rounded shadow">
			<h1 className="text-2xl font-bold mb-6">Submit a Complaint / Issue</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<input
					type="text"
					placeholder="Title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					className="w-full p-3 border border-gray-300 rounded"
				/>
				<textarea
					placeholder="Description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					className="w-full p-3 border border-gray-300 rounded"
				/>
				<button
					type="submit"
					className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700">
					Submit
				</button>
			</form>
		</div>
	);
}
