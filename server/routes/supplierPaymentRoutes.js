const express = require('express');
const router = express.Router();

const pool = require('../config/database');


/* =========================================
   ثبت پرداخت به شرکت
========================================= */

router.post('/', async (req, res) => {

    const connection =
        await pool.getConnection();

    try {

        const {
            supplier_id,
            amount,
            payment_method,
            description
        } = req.body;


        /* =========================
           اعتبارسنجی
        ========================= */

        if (!supplier_id) {

            return res.status(400).json({
                success: false,
                message: 'شرکت انتخاب نشده است'
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
           بررسی شرکت
        ========================= */

        const [suppliers] =
            await connection.query(
                `
                SELECT
                    id,
                    name
                FROM suppliers
                WHERE id = ?
                LIMIT 1
                `,
                [supplier_id]
            );


        if (suppliers.length === 0) {

            return res.status(404).json({
                success: false,
                message: 'شرکت پیدا نشد'
            });

        }


        /* =========================
           شروع تراکنش
        ========================= */

        await connection.beginTransaction();


        /* =========================
           1. ثبت پرداخت شرکت
        ========================= */

        const [paymentResult] =
            await connection.query(
                `
                INSERT INTO supplier_payments
                (
                    supplier_id,
                    amount,
                    payment_date,
                    payment_method,
                    description
                )
                VALUES (?, ?, NOW(), ?, ?)
                `,
                [
                    supplier_id,
                    Number(amount),
                    payment_method || 'cash',
                    description || null
                ]
            );


        const paymentId =
            paymentResult.insertId;


        /* =========================
           2. ثبت خروج پول از صندوق
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
                'supplier_payment',
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
                `پرداخت به شرکت - ${suppliers[0].name}`
            ]
        );


        /* =========================
           نهایی کردن تراکنش
        ========================= */

        await connection.commit();


        res.status(201).json({

            success: true,

            message:
                'پرداخت به شرکت با موفقیت ثبت شد',

            data: {

                payment_id:
                    paymentId,

                supplier_id:
                    Number(supplier_id),

                amount:
                    Number(amount)

            }

        });


    } catch (error) {

        await connection.rollback();


        console.error(
            'Supplier payment error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'ثبت پرداخت به شرکت انجام نشد',

            error:
                error.message

        });


    } finally {

        connection.release();

    }

});


module.exports = router;