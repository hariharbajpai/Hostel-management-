const BASE_URL = "http://localhost:8080/api";

export async function adminLogin(email, password) {
	try {
		const response = await fetch(`${BASE_URL}/auth/admin/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password }),
			credentials: "include", // send cookies
		});

		if (!response.ok) {
			const err = await response.json();
			throw new Error(err.message || "Login failed");
		}

		return response.json(); // returns { accessToken, refreshToken, adminData }
	} catch (error) {
		throw error;
	}
}
