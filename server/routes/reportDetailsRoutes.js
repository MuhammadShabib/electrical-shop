const express = require('express');

const router = express.Router();

const pool =
    require('../config/database');


/* =====================================================
   جزئیات گزارش مالی
===================================================== */

router.get('/', async (req, res) => {

    try {

        const {
            from,
            to
        } = req.query;


        /* =========================
           شرایط تاریخ
        ========================= */

        let dateConditionSales = '';
        let dateConditionPurchases = '';
        let dateConditionSaleReturns = '';
        let dateConditionPurchaseReturns = '';

        const salesParams = [];
        const purchaseParams = [];
        const saleReturnParams = [];
        const purchaseReturnParams = [];


        if (from) {

            dateConditionSales +=
                ' AND DATE(s.sale_date) >= ? ';

            dateConditionPurchases +=
                ' AND DATE(p.purchase_date) >= ? ';

            dateConditionSaleReturns +=
                ' AND DATE(sr.return_date) >= ? ';

            dateConditionPurchaseReturns +=
                ' AND DATE(pr.return_date) >= ? ';


            salesParams.push(from);

            purchaseParams.push(from);

            saleReturnParams.push(from);

            purchaseReturnParams.push(from);

        }


        if (to) {

            dateConditionSales +=
                ' AND DATE(s.sale_date) <= ? ';

            dateConditionPurchases +=
                ' AND DATE(p.purchase_date) <= ? ';

            dateConditionSaleReturns +=
                ' AND DATE(sr.return_date) <= ? ';

            dateConditionPurchaseReturns +=
                ' AND DATE(pr.return_date) <= ? ';


            salesParams.push(to);

            purchaseParams.push(to);

            saleReturnParams.push(to);

            purchaseReturnParams.push(to);

        }


        /* =========================
           فروش‌ها
        ========================= */

        const [sales] =
            await pool.query(
                `
                SELECT

                    s.id,

                    s.invoice_number,

                    s.customer_id,

                    COALESCE(
                        c.name,
                        'مشتری متفرقه'
                    ) AS customer_name,

                    s.total_amount,

                    s.discount,

                    s.paid_amount,

                    s.remaining_amount,

                    s.sale_date

                FROM sales s

                LEFT JOIN customers c
                    ON c.id = s.customer_id

                WHERE 1 = 1

                ${dateConditionSales}

                ORDER BY
                    s.id DESC
                `,
                salesParams
            );


        /* =========================
           خریدها
        ========================= */

        const [purchases] =
            await pool.query(
                `
                SELECT

                    p.id,

                    p.invoice_number,

                    p.supplier_id,

                    COALESCE(
                        sp.name,
                        'شرکت متفرقه'
                    ) AS supplier_name,

                    p.total_amount,

                    p.paid_amount,

                    p.remaining_amount,

                    p.purchase_date

                FROM purchases p

                LEFT JOIN suppliers sp
                    ON sp.id = p.supplier_id

                WHERE 1 = 1

                ${dateConditionPurchases}

                ORDER BY
                    p.id DESC
                `,
                purchaseParams
            );


        /* =========================
           برگشت فروش
        ========================= */

        const [saleReturns] =
            await pool.query(
                `
                SELECT

                    sr.id,

                    sr.sale_id,

                    s.invoice_number,

                    sr.customer_id,

                    COALESCE(
                        c.name,
                        'مشتری متفرقه'
                    ) AS customer_name,

                    sr.total_amount,

                    sr.refund_amount,

                    sr.description,

                    sr.return_date

                FROM sale_returns sr

                INNER JOIN sales s
                    ON s.id = sr.sale_id

                LEFT JOIN customers c
                    ON c.id = sr.customer_id

                WHERE 1 = 1

                ${dateConditionSaleReturns}

                ORDER BY
                    sr.id DESC
                `,
                saleReturnParams
            );


        /* =========================
           برگشت خرید
        ========================= */

        const [purchaseReturns] =
            await pool.query(
                `
                SELECT

                    pr.id,

                    pr.purchase_id,

                    p.invoice_number,

                    pr.supplier_id,

                    COALESCE(
                        sp.name,
                        'شرکت متفرقه'
                    ) AS supplier_name,

                    pr.total_amount,

                    pr.description,

                    pr.return_date

                FROM purchase_returns pr

                INNER JOIN purchases p
                    ON p.id = pr.purchase_id

                LEFT JOIN suppliers sp
                    ON sp.id = pr.supplier_id

                WHERE 1 = 1

                ${dateConditionPurchaseReturns}

                ORDER BY
                    pr.id DESC
                `,
                purchaseReturnParams
            );


        res.json({

            success: true,

            data: {

                sales,

                purchases,

                sale_returns:
                    saleReturns,

                purchase_returns:
                    purchaseReturns

            }

        });


    } catch (error) {

        console.error(
            'Report details error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'دریافت جزئیات گزارش انجام نشد',

            error:
                error.message

        });

    }

});


module.exports = router;