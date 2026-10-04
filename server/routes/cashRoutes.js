const express = require('express');
const router = express.Router();

const pool = require('../config/database');


/* =========================================
   دریافت تراکنش‌های صندوق
========================================= */

router.get('/', async (req, res) => {

    try {

        const [rows] = await pool.query(
            `
            SELECT
                id,
                type,
                amount,
                reference_id,
                description,
                transaction_date
            FROM cash_transactions
            ORDER BY transaction_date DESC, id DESC
            `
        );


        res.json({

            success: true,

            data: rows

        });


    } catch (error) {

        console.error(
            'Cash transactions error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'دریافت تراکنش‌های صندوق انجام نشد',

            error:
                error.message

        });

    }

});


module.exports = router;