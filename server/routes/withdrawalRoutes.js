const express = require('express');
const router = express.Router();

const pool = require('../config/database');


/* =========================================
   ثبت برداشت از صندوق
========================================= */

router.post('/', async (req, res) => {

    const connection =
        await pool.getConnection();

    try {

        const {
            amount,
            description
        } = req.body;


        /* =========================
           اعتبارسنجی مبلغ
        ========================= */

        const withdrawalAmount =
            Number(amount);


        if (
            !withdrawalAmount ||
            withdrawalAmount <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'مبلغ برداشت معتبر نیست'

            });

        }


        /* =========================
           شروع Transaction
        ========================= */

        await connection.beginTransaction();


        /* =========================
           محاسبه موجودی فعلی صندوق
           
           ورودی:
           sale
           customer_payment

           خروجی:
           purchase
           supplier_payment
           expense
           withdrawal
        ========================= */

        const [balanceRows] =
            await connection.query(
                `
                SELECT
                    COALESCE(
                        SUM(
                            CASE

                                WHEN type IN
                                (
                                    'sale',
                                    'customer_payment'
                                )
                                THEN amount

                                WHEN type IN
                                (
                                    'purchase',
                                    'supplier_payment',
                                    'expense',
                                    'withdrawal'
                                )
                                THEN -amount

                                ELSE 0

                            END
                        ),
                        0
                    ) AS balance
                FROM cash_transactions
                `
            );


        const currentBalance =
            Number(
                balanceRows[0].balance
            ) || 0;


        /* =========================
           بررسی موجودی
        ========================= */

        if (
            withdrawalAmount >
            currentBalance
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    `موجودی صندوق کافی نیست. موجودی فعلی: ${currentBalance}`

            });

        }


        /* =========================
           ثبت برداشت
        ========================= */

        const [result] =
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
                    'withdrawal',
                    ?,
                    NULL,
                    ?,
                    NOW()
                )
                `,
                [
                    withdrawalAmount,
                    description ||
                    'برداشت از صندوق'
                ]
            );


        /* =========================
           تأیید Transaction
        ========================= */

        await connection.commit();


        res.status(201).json({

            success: true,

            message:
                'برداشت با موفقیت ثبت شد',

            data: {

                withdrawal_id:
                    result.insertId,

                amount:
                    withdrawalAmount,

                balance_after:
                    currentBalance -
                    withdrawalAmount

            }

        });


    } catch (error) {

        await connection.rollback();


        console.error(
            'Withdrawal error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'ثبت برداشت انجام نشد',

            error:
                error.message

        });


    } finally {

        connection.release();

    }

});


module.exports = router;