const express = require('express');

const router = express.Router();

const pool =
    require('../config/database');


/* =====================================================
   گزارش موجودی و ارزش انبار
===================================================== */

router.get('/', async (req, res) => {

    try {

        const [rows] =
            await pool.query(
                `
                SELECT

                    p.id,

                    p.code,

                    p.name,

                    p.unit,

                    p.stock,

                    p.purchase_price,

                    p.sale_price,

                    (
                        p.stock *
                        p.purchase_price
                    ) AS inventory_cost_value,

                    (
                        p.stock *
                        p.sale_price
                    ) AS inventory_sale_value,

                    (
                        p.stock *
                        (
                            p.sale_price -
                            p.purchase_price
                        )
                    ) AS potential_profit

             FROM products p

ORDER BY
    p.name ASC
                `
            );


        res.json({

            success: true,

            data:
                rows

        });


    } catch (error) {

        console.error(
            'Inventory report error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'دریافت گزارش موجودی انجام نشد',

            error:
                error.message

        });

    }

});


module.exports = router;