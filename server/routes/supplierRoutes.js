const express = require('express');
const router = express.Router();

const pool = require('../config/database');


/* =========================
   دریافت لیست شرکت ها
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
                description
            FROM suppliers
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

            message: 'خطا در دریافت شرکت ها',

            error: error.message

        });

    }

});


/* =========================
   ثبت شرکت جدید
========================= */

router.post('/', async (req, res) => {

    try {

        const {
            name,
            phone,
            address,
            opening_balance,
            description
        } = req.body;


        /* =========================
           اعتبارسنجی
        ========================= */

        if (!name || !name.trim()) {

            return res.status(400).json({

                success: false,

                message: 'نام شرکت الزامی است'

            });

        }


        const openingBalance =
            Number(opening_balance) || 0;


        if (openingBalance < 0) {

            return res.status(400).json({

                success: false,

                message: 'مانده اولیه نمی‌تواند منفی باشد'

            });

        }


        /* =========================
           ثبت شرکت
        ========================= */

        const [result] =
            await pool.query(
                `
                INSERT INTO suppliers
                (
                    name,
                    phone,
                    address,
                    opening_balance,
                    description
                )
                VALUES (?, ?, ?, ?, ?)
                `,
                [
                    name.trim(),
                    phone || null,
                    address || null,
                    openingBalance,
                    description || null
                ]
            );


        /* =========================
           پاسخ
        ========================= */

        res.status(201).json({

            success: true,

            message:
                'شرکت با موفقیت ثبت شد',

            data: {

                id: result.insertId,

                name: name.trim(),

                phone:
                    phone || null,

                address:
                    address || null,

                opening_balance:
                    openingBalance,

                description:
                    description || null

            }

        });


    } catch (error) {

        console.error(
            'Supplier creation error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'ثبت شرکت انجام نشد',

            error:
                error.message

        });

    }

});
/* =========================
   حساب شرکت
========================= */

router.get('/:id/account', async (req, res) => {

    try {

        const supplierId =
            Number(req.params.id);


        if (!supplierId) {

            return res.status(400).json({

                success: false,

                message:
                    'شناسه شرکت معتبر نیست'

            });

        }


        /* =========================
           اطلاعات شرکت
        ========================= */

        const [suppliers] =
            await pool.query(
                `
                SELECT
                    id,
                    name,
                    phone,
                    address,
                    opening_balance,
                    description
                FROM suppliers
                WHERE id = ?
                LIMIT 1
                `,
                [supplierId]
            );


        if (suppliers.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    'شرکت پیدا نشد'

            });

        }


        const supplier =
            suppliers[0];


        /* =========================
           مجموع خریدها
        ========================= */

        const [purchaseRows] =
            await pool.query(
                `
                SELECT
                    COALESCE(
                        SUM(total_amount),
                        0
                    ) AS total_purchases
                FROM purchases
                WHERE supplier_id = ?
                `,
                [supplierId]
            );


        /* =========================
           مجموع پرداخت‌ها
        ========================= */

        const [paymentRows] =
            await pool.query(
                `
                SELECT
                    COALESCE(
                        SUM(amount),
                        0
                    ) AS total_payments
                FROM supplier_payments
                WHERE supplier_id = ?
                `,
                [supplierId]
            );


        const openingBalance =
            Number(
                supplier.opening_balance
            ) || 0;


        const totalPurchases =
            Number(
                purchaseRows[0].total_purchases
            ) || 0;


        const totalPayments =
            Number(
                paymentRows[0].total_payments
            ) || 0;


        /*
         * بدهی فروشگاه به شرکت
         */

        const balance =
            openingBalance +
            totalPurchases -
            totalPayments;


        res.json({

            success: true,

            data: {

                supplier,

                opening_balance:
                    openingBalance,

                total_purchases:
                    totalPurchases,

                total_payments:
                    totalPayments,

                balance:
                    balance

            }

        });


    } catch (error) {

        console.error(
            'Supplier account error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'دریافت حساب شرکت انجام نشد',

            error:
                error.message

        });

    }

});
/* =========================================
   گردش حساب شرکت
========================================= */

router.get('/:id/transactions', async (req, res) => {

    try {

        const supplierId =
            Number(req.params.id);


        if (!supplierId) {

            return res.status(400).json({

                success: false,

                message:
                    'شناسه شرکت معتبر نیست'

            });

        }


        /* =========================
           بررسی شرکت
        ========================= */

        const [suppliers] =
            await pool.query(
                `
                SELECT
                    id,
                    name,
                    phone
                FROM suppliers
                WHERE id = ?
                LIMIT 1
                `,
                [supplierId]
            );


        if (suppliers.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    'شرکت پیدا نشد'

            });

        }


        /* =========================
           دریافت خریدها
           خرید = بدهی به شرکت
        ========================= */

        const [purchases] =
            await pool.query(
                `
                SELECT

                    p.purchase_date AS transaction_date,

                    CONCAT(
                        'خرید ',
                        p.invoice_number
                    ) AS description,

                    p.total_amount AS debit,

                    0 AS credit,

                    'purchase' AS transaction_type,

                    p.id AS reference_id

                FROM purchases p

                WHERE p.supplier_id = ?

                `,
                [supplierId]
            );


        /* =========================
           دریافت پرداخت‌ها
           پرداخت = کاهش بدهی
        ========================= */

        const [payments] =
            await pool.query(
                `
                SELECT

                    sp.payment_date AS transaction_date,

                    COALESCE(
                        sp.description,
                        'پرداخت به شرکت'
                    ) AS description,

                    0 AS debit,

                    sp.amount AS credit,

                    'payment' AS transaction_type,

                    sp.id AS reference_id

                FROM supplier_payments sp

                WHERE sp.supplier_id = ?

                `,
                [supplierId]
            );


        /* =========================
           ترکیب تراکنش‌ها
        ========================= */

        const transactions = [

            ...purchases,

            ...payments

        ];


        /* =========================
           مرتب‌سازی از قدیم به جدید
        ========================= */

        transactions.sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.transaction_date
                    ).getTime();


                const dateB =
                    new Date(
                        b.transaction_date
                    ).getTime();


                if (dateA !== dateB) {

                    return dateA - dateB;

                }


                return (
                    Number(
                        a.reference_id
                    ) -
                    Number(
                        b.reference_id
                    )
                );

            }
        );


        /* =========================
           محاسبه مانده
        ========================= */

        let balance = 0;


        transactions.forEach(
            transaction => {

                const debit =
                    Number(
                        transaction.debit
                    ) || 0;


                const credit =
                    Number(
                        transaction.credit
                    ) || 0;


                balance +=
                    debit - credit;


                transaction.balance =
                    balance;

            }
        );


        res.json({

            success: true,

            data: {

                supplier:
                    suppliers[0],

                transactions

            }

        });


    } catch (error) {

        console.error(
            'Supplier transactions error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'دریافت گردش حساب شرکت انجام نشد',

            error:
                error.message

        });

    }

});

module.exports = router;
module.exports = router;