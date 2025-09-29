import React, { useState } from "react";
import { adminLogin } from "../services/authService";

export default function AdminLogin() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const data = await adminLogin(email, password);
			console.log("Login successful:", data);
			alert("Login successful!");
			// TODO: redirect to admin dashboard
		} catch (err) {
			console.error(err);
			alert("Login failed: " + err.message);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<form
				onSubmit={handleSubmit}
				className="bg-white p-8 rounded shadow-md w-full max-w-md">
				<h1 className="text-2xl font-bold mb-6">Admin Login</h1>
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full p-3 mb-4 border border-gray-300 rounded"
				/>
				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full p-3 mb-4 border border-gray-300 rounded"
				/>
				<button
					type="submit"
					className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700">
					Login
				</button>
			</form>
		</div>
	);
}
