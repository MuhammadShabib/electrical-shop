const express = require('express');
const router = express.Router();
const pool = require('../config/database');

const {
    requireAdmin,
    requireRole
} = require('../middleware/authMiddleware');
/* =========================
   دریافت همه مشتریان
========================= */

router.get('/', async (req, res) => {

    try {

        const [rows] = await pool.query(`
            SELECT
                id,
                name,
                phone,
                address,
                opening_balance,
                opening_balance_type,
                description,
                status,
                created_at
            FROM customers
            ORDER BY id DESC
        `);


        res.json({
            success: true,
            data: rows
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'خطا در دریافت مشتریان'
        });

    }

});


/* =========================
   دریافت یک مشتری
========================= */

router.get('/:id', async (req, res) => {

    try {

        const { id } = req.params;


        const [rows] = await pool.query(
            'SELECT * FROM customers WHERE id = ?',
            [id]
        );


        if (rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: 'مشتری پیدا نشد'
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
            message: 'خطا در دریافت اطلاعات مشتری'
        });

    }

});


/* =========================
   ثبت مشتری
========================= */

router.post('/', async (req, res) => {

    try {

        const {
            name,
            phone,
            address,
            opening_balance,
            opening_balance_type,
            description
        } = req.body;


        if (!name || name.trim() === '') {

            return res.status(400).json({
                success: false,
                message: 'نام مشتری الزامی است'
            });

        }


        const [result] = await pool.query(`
            INSERT INTO customers
            (
                name,
                phone,
                address,
                opening_balance,
                opening_balance_type,
                description
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `, [

            name.trim(),

            phone || null,

            address || null,

            Number(opening_balance) || 0,

            opening_balance_type === 'credit'
                ? 'credit'
                : 'debit',

            description || null

        ]);


        res.status(201).json({

            success: true,

            message: 'مشتری با موفقیت ثبت شد',

            id: result.insertId

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'خطا در ثبت مشتری'
        });

    }

});


/* =========================
   ویرایش مشتری
========================= */

router.put('/:id', async (req, res) => {

    try {

        const { id } = req.params;


        const {
            name,
            phone,
            address,
            description
        } = req.body;


        if (!name || name.trim() === '') {

            return res.status(400).json({
                success: false,
                message: 'نام مشتری الزامی است'
            });

        }


        const [result] = await pool.query(`
            UPDATE customers
            SET
                name = ?,
                phone = ?,
                address = ?,
                description = ?
            WHERE id = ?
        `, [

            name.trim(),

            phone || null,

            address || null,

            description || null,

            id

        ]);


        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: 'مشتری پیدا نشد'
            });

        }


        res.json({
            success: true,
            message: 'مشتری با موفقیت ویرایش شد'
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'خطا در ویرایش مشتری'
        });

    }

});


/* =========================
   غیرفعال کردن مشتری
========================= */

router.delete(
    '/:id',
    requireAdmin,
    async (req, res) => {

    try {

        const { id } = req.params;


        const [result] = await pool.query(
            'UPDATE customers SET status = 0 WHERE id = ?',
            [id]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: 'مشتری پیدا نشد'
            });

        }


        res.json({
            success: true,
            message: 'مشتری غیرفعال شد'
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'خطا در غیرفعال کردن مشتری'
        });

    }

});


/* =========================
   فعال کردن مشتری
========================= */

router.put(
    '/:id/enable',
    requireAdmin,
    async (req, res) => {

    try {

        const { id } = req.params;


        const [result] = await pool.query(
            'UPDATE customers SET status = 1 WHERE id = ?',
            [id]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: 'مشتری پیدا نشد'
            });

        }


        res.json({
            success: true,
            message: 'مشتری فعال شد'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'خطا در فعال کردن مشتری'
        });

    }

});

/* =========================
   دریافت گردش حساب مشتری
========================= */

router.get('/:id/transactions', async (req, res) => {

    try {

        const { id } = req.params;


        // بررسی وجود مشتری
        const [customers] = await pool.query(
            'SELECT * FROM customers WHERE id = ?',
            [id]
        );


        if (customers.length === 0) {

            return res.status(404).json({
                success: false,
                message: 'مشتری پیدا نشد'
            });

        }


        // دریافت تراکنش‌ها
        const [transactions] = await pool.query(`
            SELECT
                id,
                customer_id,
                type,
                amount,
                description,
                reference_type,
                reference_id,
                created_at
            FROM customer_transactions
            WHERE customer_id = ?
            ORDER BY created_at ASC, id ASC
        `, [id]);


        res.json({
            success: true,
            customer: customers[0],
            data: transactions
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'خطا در دریافت گردش حساب'
        });

    }

});


/* =========================
   ثبت تراکنش حساب مشتری
========================= */

router.post(
    '/:id/transactions',
    requireRole(
        'admin',
        'accountant'
    ),
    async (req, res) => {

    try {

        const { id } = req.params;

        const {
            type,
            amount,
            description
        } = req.body;


        // بررسی نوع تراکنش
        if (type !== 'debit' && type !== 'credit') {

            return res.status(400).json({
                success: false,
                message: 'نوع تراکنش نامعتبر است'
            });

        }


        // بررسی مبلغ
        if (
            amount === undefined ||
            amount === null ||
            Number(amount) <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: 'مبلغ باید بیشتر از صفر باشد'
            });

        }


        // بررسی مشتری
        const [customers] = await pool.query(
            'SELECT id FROM customers WHERE id = ?',
            [id]
        );


        if (customers.length === 0) {

            return res.status(404).json({
                success: false,
                message: 'مشتری پیدا نشد'
            });

        }


        // ثبت تراکنش
        const [result] = await pool.query(`
            INSERT INTO customer_transactions
            (
                customer_id,
                type,
                amount,
                description,
                reference_type
            )
            VALUES (?, ?, ?, ?, ?)
        `, [

            id,

            type,

            Number(amount),

            description || null,

            'manual'

        ]);


        res.status(201).json({

            success: true,

            message: 'تراکنش با موفقیت ثبت شد',

            id: result.insertId

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'خطا در ثبت تراکنش'
        });

    }

});

/* =========================
   محاسبه مانده حساب مشتری
========================= */

router.get('/:id/balance', async (req, res) => {

    try {

        const { id } = req.params;


        // دریافت اطلاعات مشتری
        const [customers] = await pool.query(
            `
            SELECT
                id,
                name,
                opening_balance,
                opening_balance_type
            FROM customers
            WHERE id = ?
            `,
            [id]
        );


        if (customers.length === 0) {

            return res.status(404).json({
                success: false,
                message: 'مشتری پیدا نشد'
            });

        }


        const customer = customers[0];


        // دریافت مجموع بدهکاری‌ها و پرداخت‌ها
        const [transactions] = await pool.query(
            `
            SELECT

                COALESCE(
                    SUM(
                        CASE
                            WHEN type = 'debit'
                            THEN amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS total_debit,

                COALESCE(
                    SUM(
                        CASE
                            WHEN type = 'credit'
                            THEN amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS total_credit

            FROM customer_transactions

            WHERE customer_id = ?
            `,
            [id]
        );


        const totalDebit =
            Number(transactions[0].total_debit);


        const totalCredit =
            Number(transactions[0].total_credit);


        /*
         * موجودی اولیه
         *
         * debit:
         * مشتری بدهکار است
         *
         * credit:
         * مشتری طلبکار است
         */

        let debit =
            totalDebit;

        let credit =
            totalCredit;


        if (
            customer.opening_balance_type === 'debit'
        ) {

            debit +=
                Number(customer.opening_balance);

        } else {

            credit +=
                Number(customer.opening_balance);

        }


        // محاسبه نهایی
        const balance =
            Math.abs(debit - credit);


        let balanceType = 'balanced';


        if (debit > credit) {

            balanceType = 'debit';

        } else if (credit > debit) {

            balanceType = 'credit';

        }


        res.json({

            success: true,

            data: {

                customer_id:
                    customer.id,

                customer_name:
                    customer.name,

                total_debit:
                    debit,

                total_credit:
                    credit,

                balance:
                    balance,

                balance_type:
                    balanceType

            }

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: 'خطا در محاسبه مانده حساب'

        });

    }

});

module.exports = router;