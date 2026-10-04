const express = require('express');
const router = express.Router();
const pool = require('../config/database');

const {
    requireAuth,
    requireAdmin
} = require('../middleware/authMiddleware');




// دریافت تمام دواها
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.id,
                p.code,
                p.name,
                p.category_id,
                c.name AS category_name,
                p.unit,
                p.purchase_price,
                p.sale_price,
                p.stock,
                p.min_stock,
                p.description,
                p.status,
                p.created_at
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.id DESC
        `);

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'خطا در دریافت دواها'
        });
    }
});


// دریافت یک دوا
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            'SELECT * FROM products WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'دوا پیدا نشد'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'خطا در دریافت دوا'
        });
    }
});


// ثبت دوا
// ثبت دوا
router.post('/', async (req, res) => {

    const connection =
        await pool.getConnection();

    try {

        const {
            code,
            name,
            category_id,
            unit,
            purchase_price,
            sale_price,
            stock,
            min_stock,
            description,
            opening_expiry_date
        } = req.body;


        const initialStock =
            Number(stock) || 0;


        /* =========================
           اعتبارسنجی
        ========================= */

        if (!code || !name) {

            return res.status(400).json({
                success: false,
                message:
                    'کد دوا و نام دوا الزامی است'
            });

        }


        if (initialStock < 0) {

            return res.status(400).json({
                success: false,
                message:
                    'موجودی اولیه نمی‌تواند منفی باشد'
            });

        }


        /*
         * اگر موجودی اولیه بیشتر از صفر باشد،
         * تاریخ انقضا الزامی است.
         */

        if (
            initialStock > 0 &&
            !opening_expiry_date
        ) {

            return res.status(400).json({
                success: false,
                message:
                    'برای موجودی اولیه، تاریخ انقضا الزامی است'
            });

        }


        /* =========================
           شروع Transaction
        ========================= */

        await connection.beginTransaction();


        /* =========================
           ثبت دوا
        ========================= */

        const [result] =
            await connection.query(
                `
                INSERT INTO products
                (
                    code,
                    name,
                    category_id,
                    unit,
                    purchase_price,
                    sale_price,
                    stock,
                    min_stock,
                    description
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    code,
                    name,
                    category_id || null,
                    unit || 'دانه',
                    Number(purchase_price) || 0,
                    Number(sale_price) || 0,
                    initialStock,
                    Number(min_stock) || 0,
                    description || null
                ]
            );


        const productId =
            result.insertId;


        /* =========================
           ساخت بچ افتتاحیه
        ========================= */

        if (
            initialStock > 0
        ) {

            const openingBatchNumber =
                `OPENING-${String(productId).padStart(6, '0')}`;


            await connection.query(
                `
                INSERT INTO medicine_batches
                (
                    product_id,
                    batch_number,
                    expiry_date,
                    quantity,
                    purchase_price,
                    sale_price,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, 1)
                `,
                [
                    productId,
                    openingBatchNumber,
                    opening_expiry_date,
                    initialStock,
                    Number(purchase_price) || 0,
                    Number(sale_price) || 0
                ]
            );

        }


        /* =========================
           نهایی کردن Transaction
        ========================= */

        await connection.commit();


        res.status(201).json({

            success: true,

            message:
                'دوا با موفقیت ثبت شد',

            id:
                productId

        });


    } catch (error) {

        await connection.rollback();


        console.error(error);


        if (
            error.code === 'ER_DUP_ENTRY'
        ) {

            return res.status(400).json({
                success: false,
                message:
                    'کد دوا قبلاً ثبت شده است'
            });

        }


        res.status(500).json({

            success: false,

            message:
                'خطا در ثبت دوا'

        });


    } finally {

        connection.release();

    }

});

// ویرایش دوا
router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const {
            code,
            name,
            category_id,
            unit,
            purchase_price,
            sale_price,
            min_stock,
            description
        } = req.body;

        const [result] = await pool.query(`
            UPDATE products SET
                code = ?,
                name = ?,
                category_id = ?,
                unit = ?,
                purchase_price = ?,
                sale_price = ?,
                min_stock = ?,
                description = ?
            WHERE id = ?
        `, [
            code,
            name,
            category_id || null,
            unit || 'عدد',
            purchase_price || 0,
            sale_price || 0,
            min_stock || 0,
            description || null,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'دوا پیدا نشد'
            });
        }

        res.json({
            success: true,
            message: 'دوا با موفقیت ویرایش شد'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'خطا در ویرایش دوا'
        });
    }
});


// غیرفعال کردن دوا
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            'UPDATE products SET status = 0 WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'دوا پیدا نشد'
            });
        }

        res.json({
            success: true,
            message: 'دوا غیرفعال شد'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'خطا در غیرفعال کردن دوا'
        });
    }
});

router.put('/:id/enable', requireAdmin, async (req, res) => {

    try {

        const { id } = req.params;

        const [result] = await pool.query(
            'UPDATE products SET status = 1 WHERE id = ?',
            [id]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: 'دوا پیدا نشد'
            });

        }


        res.json({
            success: true,
            message: 'دوا فعال شد'
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'خطا در فعال کردن دوا'
        });

    }

});

module.exports = router;