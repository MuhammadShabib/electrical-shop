const express = require('express');
const router = express.Router();

const pool = require('../config/database');


/* =========================================
   ثبت هزینه
========================================= */

router.post('/', async (req, res) => {

    const connection =
        await pool.getConnection();

    try {

        const {
            title,
            amount,
            expense_date,
            description
        } = req.body;


        /* =========================
           اعتبارسنجی
        ========================= */

        if (!title || !title.trim()) {

            return res.status(400).json({
                success: false,
                message: 'عنوان هزینه وارد نشده است'
            });

        }


        const expenseAmount =
            Number(amount);


        if (
            !expenseAmount ||
            expenseAmount <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: 'مبلغ هزینه معتبر نیست'
            });

        }


        /* =========================
           شروع Transaction
        ========================= */

        await connection.beginTransaction();


        /* =========================
           ثبت هزینه
        ========================= */

        const [expenseResult] =
            await connection.query(
                `
                INSERT INTO expenses
                (
                    title,
                    amount,
                    expense_date,
                    description
                )
                VALUES (?, ?, ?, ?)
                `,
                [
                    title.trim(),
                    expenseAmount,

                    expense_date || new Date(),

                    description || null
                ]
            );


        const expenseId =
            expenseResult.insertId;


        /* =========================
           ثبت خروج پول از صندوق
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
                'expense',
                ?,
                ?,
                ?,
                ?
            )
            `,
            [
                expenseAmount,

                expenseId,

                description ||
                `هزینه: ${title.trim()}`,

                expense_date || new Date()
            ]
        );


        /* =========================
           تأیید Transaction
        ========================= */

        await connection.commit();


        res.status(201).json({

            success: true,

            message:
                'هزینه با موفقیت ثبت شد',

            data: {

                expense_id:
                    expenseId,

                title:
                    title.trim(),

                amount:
                    expenseAmount

            }

        });


    } catch (error) {

        await connection.rollback();

        console.error(
            'Expense error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'ثبت هزینه انجام نشد',

            error:
                error.message

        });


    } finally {

        connection.release();

    }

});


/* =========================================
   دریافت لیست هزینه‌ها
========================================= */

router.get('/', async (req, res) => {

    try {

        const [rows] =
            await pool.query(
                `
                SELECT
                    id,
                    title,
                    amount,
                    expense_date,
                    description
                FROM expenses
                ORDER BY expense_date DESC, id DESC
                `
            );


        res.json({

            success: true,

            data: rows

        });


    } catch (error) {

        console.error(
            'Get expenses error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'دریافت لیست هزینه‌ها انجام نشد',

            error:
                error.message

        });

    }

});


module.exports = router;