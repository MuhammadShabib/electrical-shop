const express = require('express');
const router = express.Router();
const pool = require('../config/database');

const {
    requireAdmin
} = require('../middleware/authMiddleware');

// دریافت تمام دسته‌بندی‌ها
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM categories ORDER BY id DESC'
        );

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'خطا در دریافت دسته‌بندی‌ها'
        });
    }
});

// ثبت دسته‌بندی جدید
router.post(
    '/',
    requireAdmin,
    async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'نام دسته‌بندی الزامی است'
            });
        }

        const [result] = await pool.query(
            'INSERT INTO categories (name, description) VALUES (?, ?)',
            [name.trim(), description || null]
        );

        res.status(201).json({
            success: true,
            message: 'دسته‌بندی با موفقیت ثبت شد',
            id: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'خطا در ثبت دسته‌بندی'
        });
    }
});

module.exports = router;