const express = require('express');

const router = express.Router();

const pool =
    require('../config/database');


/* =====================================================
   گزارش سود بر اساس دوا
   با درنظر گرفتن:
   - تخفیف فاکتور
   - برگشت فروش
===================================================== */

router.get('/', async (req, res) => {

    try {

        const {
            from,
            to
        } = req.query;


        /* =========================
           شرایط تاریخ فروش
        ========================= */

        let saleDateCondition = '';

        const saleParams = [];


        if (from) {

            saleDateCondition +=
                ' AND DATE(s.sale_date) >= ? ';

            saleParams.push(from);

        }


        if (to) {

            saleDateCondition +=
                ' AND DATE(s.sale_date) <= ? ';

            saleParams.push(to);

        }


        /* =========================
           شرایط تاریخ برگشت
        ========================= */

        let returnDateCondition = '';

        const returnParams = [];


        if (from) {

            returnDateCondition +=
                ' AND DATE(sr.return_date) >= ? ';

            returnParams.push(from);

        }


        if (to) {

            returnDateCondition +=
                ' AND DATE(sr.return_date) <= ? ';

            returnParams.push(to);

        }


        /* =================================================
           فروش هر دوا

           تخفیف فاکتور به نسبت ارزش هر قلم
           بین اقلام فاکتور تقسیم می‌شود.
        ================================================= */

        const [saleRows] =
            await pool.query(
                `
                SELECT

                    si.product_id,

                    p.code,

                    p.name,

                    p.unit,

                    COALESCE(
                        SUM(si.quantity),
                        0
                    ) AS sold_quantity,

                    COALESCE(
                        SUM(
                            (
                                si.quantity *
                                si.sale_price
                            )
                            *
                            (
                                1 -
                                CASE

                                    WHEN
                                        (
                                            s.total_amount +
                                            s.discount
                                        ) > 0

                                    THEN
                                        s.discount /
                                        (
                                            s.total_amount +
                                            s.discount
                                        )

                                    ELSE 0

                                END
                            )
                        ),
                        0
                    ) AS total_sales,

                    COALESCE(
                        SUM(
                            si.quantity *
                            si.purchase_price
                        ),
                        0
                    ) AS cost_of_goods_sold

                FROM sale_items si

                INNER JOIN sales s
                    ON s.id = si.sale_id

                INNER JOIN products p
                    ON p.id = si.product_id

                WHERE 1 = 1

                ${saleDateCondition}

                GROUP BY

                    si.product_id,

                    p.code,

                    p.name,

                    p.unit
                `,
                saleParams
            );


        /* =================================================
           برگشت فروش هر دوا
        ================================================= */

        const [returnRows] =
            await pool.query(
                `
                SELECT

                    sri.product_id,

                    COALESCE(
                        SUM(sri.quantity),
                        0
                    ) AS returned_quantity,

                    COALESCE(
                        SUM(
                            sri.quantity *
                            sri.sale_price
                        ),
                        0
                    ) AS returned_sales,

                    COALESCE(
                        SUM(
                            sri.quantity *
                            sri.purchase_price
                        ),
                        0
                    ) AS returned_cost

                FROM sale_return_items sri

                INNER JOIN sale_returns sr
                    ON sr.id = sri.return_id

                WHERE 1 = 1

                ${returnDateCondition}

                GROUP BY
                    sri.product_id
                `,
                returnParams
            );


        /* =================================================
           تبدیل برگشت‌ها به Map
        ================================================= */

        const returnMap =
            new Map();


        returnRows.forEach(
            row => {

                returnMap.set(
                    Number(row.product_id),
                    {

                        returned_quantity:
                            Number(
                                row.returned_quantity
                            ) || 0,

                        returned_sales:
                            Number(
                                row.returned_sales
                            ) || 0,

                        returned_cost:
                            Number(
                                row.returned_cost
                            ) || 0

                    }
                );

            }
        );


        /* =================================================
           محاسبه نهایی
        ================================================= */

        const rows =
            saleRows.map(
                row => {

                    const productId =
                        Number(
                            row.product_id
                        );


                    const returned =
                        returnMap.get(
                            productId
                        ) || {

                            returned_quantity: 0,

                            returned_sales: 0,

                            returned_cost: 0

                        };


                    const soldQuantity =
                        Number(
                            row.sold_quantity
                        ) || 0;


                    const totalSales =
                        Number(
                            row.total_sales
                        ) || 0;


                    const costOfGoodsSold =
                        Number(
                            row.cost_of_goods_sold
                        ) || 0;


                    const netQuantity =
                        soldQuantity -
                        returned.returned_quantity;


                    const netSales =
                        totalSales -
                        returned.returned_sales;


                    const netCost =
                        costOfGoodsSold -
                        returned.returned_cost;


                    const profit =
                        netSales -
                        netCost;


                    return {

                        id:
                            productId,

                        code:
                            row.code,

                        name:
                            row.name,

                        unit:
                            row.unit,

                        sold_quantity:
                            netQuantity,

                        total_sales:
                            netSales,

                        cost_of_goods_sold:
                            netCost,

                        profit:
                            profit

                    };

                }
            );


        /* =================================================
           حذف مواردی که کاملاً برگشت خورده‌اند
        ================================================= */

        const filteredRows =
            rows.filter(
                row =>
                    Number(
                        row.sold_quantity
                    ) !== 0 ||
                    Number(
                        row.total_sales
                    ) !== 0 ||
                    Number(
                        row.profit
                    ) !== 0
            );


        /* =================================================
           مرتب‌سازی بر اساس سود
        ================================================= */

        filteredRows.sort(
            (a, b) =>
                Number(b.profit) -
                Number(a.profit)
        );


        res.json({

            success: true,

            data:
                filteredRows

        });


    } catch (error) {

        console.error(
            'Product profit report error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'دریافت گزارش سود دواها انجام نشد',

            error:
                error.message

        });

    }

});


module.exports = router;