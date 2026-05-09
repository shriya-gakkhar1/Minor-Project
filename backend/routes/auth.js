const express = require('express');

const router = express.Router();

router.post('/login', (req, res) => {
	const { role = 'student', email = '' } = req.body || {};

	if (!email) {
		return res.status(400).json({ ok: false, message: 'Email is required.' });
	}

	const normalizedRole = role === 'admin' || role === 'tpo' ? 'tpo' : 'student';

	return res.json({
		ok: true,
		user: {
			id: normalizedRole === 'tpo' ? 'admin_01' : 'stu_01',
			email,
			role: normalizedRole,
		},
	});
});

router.get('/me', (req, res) => {
	return res.json({ ok: true, message: 'Auth route active' });
});

module.exports = router;
