const express = require('express');

const router = express.Router();

const pool =
    require('../config/database');


/* =====================================================
   گزارش گردش انبار
===================================================== */

router.get('/', async (req, res) => {

    try {

        const {
            product_id,
            from,
            to
        } = req.query;


        /* =========================
           شرایط فیلتر
        ========================= */

        let conditions = '';

        const params = [];


        if (product_id) {

            conditions +=
                ' AND sm.product_id = ? ';

            params.push(product_id);

        }


        if (from) {

            conditions +=
                ' AND DATE(sm.movement_date) >= ? ';

            params.push(from);

        }


        if (to) {

            conditions +=
                ' AND DATE(sm.movement_date) <= ? ';

            params.push(to);

        }


        /* =========================
           دریافت گردش انبار
        ========================= */

        const [rows] =
            await pool.query(
                `
                SELECT

                    sm.id,

                    sm.product_id,

                    p.code AS product_code,

                    p.name AS product_name,

                    p.unit AS product_unit,

                    sm.type,

                    sm.quantity,

                    sm.reference_id,

                    sm.description,

                    sm.movement_date

                FROM stock_movements sm

                INNER JOIN products p
                    ON p.id = sm.product_id

                WHERE 1 = 1

                ${conditions}

                ORDER BY
                    sm.id DESC
                `,
                params
            );


        res.json({

            success: true,

            data:
                rows

        });


    } catch (error) {

        console.error(
            'Stock movement report error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'دریافت گردش انبار انجام نشد',

            error:
                error.message

        });

    }

});


module.exports = router;