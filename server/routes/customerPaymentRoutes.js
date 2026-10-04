const express = require('express');
const router = express.Router();

const pool = require('../config/database');


/* =========================================
   ثبت پرداخت مشتری
========================================= */

router.post('/', async (req, res) => {

    const connection = await pool.getConnection();

    try {

        const {
            customer_id,
            amount,
            payment_method,
            description
        } = req.body;


        /* =========================
           اعتبارسنجی
        ========================= */

        if (!customer_id) {

            return res.status(400).json({
                success: false,
                message: 'مشتری انتخاب نشده است'
            });

        }


        if (!amount || Number(amount) <= 0) {

            return res.status(400).json({
                success: false,
                message: 'مبلغ پرداختی معتبر نیست'
            });

        }


        const validMethods = [
            'cash',
            'card',
            'transfer'
        ];


        if (
            payment_method &&
            !validMethods.includes(payment_method)
        ) {

            return res.status(400).json({
                success: false,
                message: 'روش پرداخت معتبر نیست'
            });

        }


        /* =========================
           بررسی مشتری
        ========================= */

        const [customers] =
            await connection.query(
                `
                SELECT id, name
                FROM customers
                WHERE id = ?
                LIMIT 1
                `,
                [customer_id]
            );


        if (customers.length === 0) {

            return res.status(404).json({
                success: false,
                message: 'مشتری پیدا نشد'
            });

        }


        /* =========================
           شروع تراکنش MySQL
        ========================= */

        await connection.beginTransaction();


        /* =========================
           1. ثبت پرداخت مشتری
        ========================= */

        const [paymentResult] =
            await connection.query(
                `
                INSERT INTO customer_payments
                (
                    customer_id,
                    amount,
                    payment_date,
                    payment_method,
                    description
                )
                VALUES (?, ?, NOW(), ?, ?)
                `,
                [
                    customer_id,
                    Number(amount),
                    payment_method || 'cash',
                    description || null
                ]
            );


        const paymentId =
            paymentResult.insertId;


        /* =========================
           2. ثبت تراکنش حساب مشتری
           
           پرداخت مشتری = credit
        ========================= */

        await connection.query(
            `
            INSERT INTO customer_transactions
            (
                customer_id,
                type,
                amount,
                description,
                reference_type,
                reference_id,
                created_at
            )
            VALUES
            (
                ?,
                'credit',
                ?,
                ?,
                'customer_payment',
                ?,
                NOW()
            )
            `,
            [
                customer_id,
                Number(amount),
                description ||
                `پرداخت مشتری - ${payment_method || 'cash'}`,
                paymentId
            ]
        );


        /* =========================
           3. ثبت ورود پول به صندوق
        ========================= */

        await connection.query(
            `
            INSERT INTO cash_transactions
            (
                type,
                amount,
                reference_id,
                description,
                transaction_date
            )
            VALUES
            (
                'customer_payment',
                ?,
                ?,
                ?,
                NOW()
            )
            `,
            [
                Number(amount),
                paymentId,
                description ||
                `دریافت از مشتری - ${customers[0].name}`
            ]
        );


        /* =========================
           نهایی کردن همه عملیات
        ========================= */

        await connection.commit();


        res.status(201).json({

            success: true,

            message:
                'پرداخت مشتری با موفقیت ثبت شد',

            data: {

                payment_id:
                    paymentId,

                customer_id:
                    Number(customer_id),

                amount:
                    Number(amount)

            }

        });


    } catch (error) {

        /* =========================
           لغو همه عملیات در صورت خطا
        ========================= */

        await connection.rollback();


        console.error(
            'Customer payment error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'ثبت پرداخت مشتری انجام نشد',

            error:
                error.message

        });


    } finally {

        connection.release();

    }

});


module.exports = router;