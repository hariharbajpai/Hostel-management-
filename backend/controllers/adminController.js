import User from '../models/User.js';

// Add a single student manually
export const addStudent = async (req, res) => {
    try {
        const { email, name, branch, batch, phone } = req.body;

        if (!email || !branch || !batch) {
            return res.status(400).json({ error: 'Email, branch, and batch are required' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const newUser = await User.create({
            email: email.toLowerCase(),
            name,
            branch,
            batch,
            phone,
            role: 'student'
        });

        res.status(201).json({ message: 'Student added successfully', user: newUser });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Bulk add students via CSV (JSON payload)
export const bulkAddStudents = async (req, res) => {
    try {
        const { students } = req.body; // Expecting an array of student objects

        if (!Array.isArray(students) || students.length === 0) {
            return res.status(400).json({ error: 'Invalid or empty students list' });
        }

        const results = {
            added: 0,
            failed: 0,
            errors: []
        };

        for (const student of students) {
            const { email, name, branch, batch, phone } = student;

            if (!email || !branch || !batch) {
                results.failed++;
                results.errors.push({ email, error: 'Missing required fields' });
                continue;
            }

            try {
                const existingUser = await User.findOne({ email: email.toLowerCase() });
                if (existingUser) {
                    results.failed++;
                    results.errors.push({ email, error: 'User already exists' });
                    continue;
                }

                await User.create({
                    email: email.toLowerCase(),
                    name,
                    branch,
                    batch,
                    phone,
                    role: 'student'
                });
                results.added++;
            } catch (err) {
                results.failed++;
                results.errors.push({ email, error: err.message });
            }
        }

        res.json({ message: 'Bulk add process completed', results });
    } catch (error) {
        console.error('Error in bulk add:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        res.json({ totalStudents });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
