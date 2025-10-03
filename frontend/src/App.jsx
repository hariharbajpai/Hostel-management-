import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import AdminLogin from "./pages/AdminLogin";
import ComplaintForm from "./pages/ComplaintForm";
import Notifications from "./pages/Notifications";

// Placeholder page
function RoomChange() {
	return (
		<h2 className="text-xl font-bold">
			Room Change / Mutual Exchange Page (Coming Soon)
		</h2>
	);
}

export default function App() {
	return (
		<Router>
			<Routes>
				{/* Login page route */}
				<Route path="/login" element={<AdminLogin />} />

				{/* Layout route wraps all pages after login */}
				<Route path="/" element={<Layout />}>
					<Route
						index
						element={
							<h2 className="text-xl font-bold">
								Dashboard Page (Coming Soon)
							</h2>
						}
					/>
					<Route path="complaint" element={<ComplaintForm />} />
					<Route path="notifications" element={<Notifications />} />
					<Route path="room-change" element={<RoomChange />} />
				</Route>
			</Routes>
		</Router>
	);
}
