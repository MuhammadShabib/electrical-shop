const express = require('express');
const router = express.Router();

const pool = require('../config/database');


/* =========================================
   گزارش مالی
========================================= */

router.get('/', async (req, res) => {

    try {

        const {
            from,
            to
        } = req.query;


        /* =========================
           فیلتر تاریخ
        ========================= */

        let dateConditionSales = '';
        let dateConditionExpenses = '';
        let dateConditionCash = '';
let dateConditionReturns = '';
        const salesParams = [];
        const expenseParams = [];
        const cashParams = [];
        const returnParams = [];


        if (from) {

            dateConditionSales +=
                ' AND DATE(s.sale_date) >= ? ';

            dateConditionExpenses +=
                ' AND DATE(e.expense_date) >= ? ';

            dateConditionCash +=
                ' AND DATE(ct.transaction_date) >= ? ';
dateConditionReturns +=
    ' AND DATE(sr.return_date) >= ? ';

            salesParams.push(from);
            expenseParams.push(from);
            cashParams.push(from);
            returnParams.push(from);

        }


        if (to) {

            dateConditionSales +=
                ' AND DATE(s.sale_date) <= ? ';

            dateConditionExpenses +=
                ' AND DATE(e.expense_date) <= ? ';

            dateConditionCash +=
                ' AND DATE(ct.transaction_date) <= ? ';

dateConditionReturns +=
    ' AND DATE(sr.return_date) <= ? ';

returnParams.push(to);
            salesParams.push(to);
            expenseParams.push(to);
            cashParams.push(to);

        }


        /* =========================
           فروش
        ========================= */

        const [salesRows] =
            await pool.query(
                `
                SELECT
                    COUNT(*) AS sales_count,
                    COALESCE(
                        SUM(
                            s.total_amount +
                            s.discount
                        ),
                        0
                    ) AS gross_sales,
                    COALESCE(
                        SUM(s.discount),
                        0
                    ) AS total_discount,
                    COALESCE(
                        SUM(s.total_amount),
                        0
                    ) AS net_sales
                FROM sales s
                WHERE 1 = 1
                ${dateConditionSales}
                `,
                salesParams
            );

            /* =========================
   برگشت فروش
========================= */

const [returnRows] =
    await pool.query(
        `
        SELECT
            COALESCE(
                SUM(sr.total_amount),
                0
            ) AS total_sales_returns
        FROM sale_returns sr
        WHERE 1 = 1
        ${dateConditionReturns}
        `,
        returnParams
    );

    /* =========================
   بهای تمام‌شده برگشت فروش
========================= */

const [returnedCogsRows] =
    await pool.query(
        `
        SELECT
            COALESCE(
                SUM(
                    sri.quantity *
                    sri.purchase_price
                ),
                0
            ) AS returned_cogs
        FROM sale_return_items sri
        INNER JOIN sale_returns sr
            ON sr.id = sri.return_id
        WHERE 1 = 1
        ${dateConditionReturns}
        `,
        returnParams
    );

        /* =========================
           بهای تمام‌شده
        ========================= */

        const [cogsRows] =
            await pool.query(
                `
                SELECT
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
                WHERE 1 = 1
                ${dateConditionSales}
                `,
                salesParams
            );


        /* =========================
           هزینه‌ها
        ========================= */

        const [expenseRows] =
            await pool.query(
                `
                SELECT
                    COUNT(*) AS expenses_count,
                    COALESCE(
                        SUM(e.amount),
                        0
                    ) AS total_expenses
                FROM expenses e
                WHERE 1 = 1
                ${dateConditionExpenses}
                `,
                expenseParams
            );


        /* =========================
           موجودی فعلی صندوق
           
           موجودی فعلی مستقل از
           بازه گزارش است.
        ========================= */

        const [cashRows] =
            await pool.query(
                `
                SELECT
                    COALESCE(
                        SUM(
                            CASE

                                WHEN ct.type IN
                                (
                                    'sale',
                                    'customer_payment'
                                )
                                THEN ct.amount

                            WHEN ct.type IN
(
    'purchase',
    'supplier_payment',
    'expense',
    'withdrawal',
    'sale_return'
)
THEN -ct.amount

                                ELSE 0

                            END
                        ),
                        0
                    ) AS cash_balance
                FROM cash_transactions ct
                `
            );


        const sales =
            salesRows[0] || {};


        const cogs =
            cogsRows[0] || {};


        const expenses =
            expenseRows[0] || {};


        const grossSales =
            Number(
                sales.gross_sales
            ) || 0;


        const totalDiscount =
            Number(
                sales.total_discount
            ) || 0;
const totalSalesReturns =
    Number(
        returnRows[0].total_sales_returns
    ) || 0;

       const originalNetSales =
    Number(
        sales.net_sales
    ) || 0;


const netSales =
    originalNetSales -
    totalSalesReturns;

    const returnedCogs =
    Number(
        returnedCogsRows[0].returned_cogs
    ) || 0;


const originalCostOfGoodsSold =
    Number(
        cogs.cost_of_goods_sold
    ) || 0;


const costOfGoodsSold =
    originalCostOfGoodsSold -
    returnedCogs;
        const totalExpenses =
            Number(
                expenses.total_expenses
            ) || 0;


        const grossProfit =
            netSales -
            costOfGoodsSold;


        const netProfit =
            grossProfit -
            totalExpenses;


        const cashBalance =
            Number(
                cashRows[0].cash_balance
            ) || 0;


        res.json({

            success: true,

            data: {

                sales_count:
                    Number(
                        sales.sales_count
                    ) || 0,

                expenses_count:
                    Number(
                        expenses.expenses_count
                    ) || 0,

                gross_sales:
                    grossSales,

                total_discount:
                    totalDiscount,

                net_sales:
                    netSales,

                cost_of_goods_sold:
                    costOfGoodsSold,

                gross_profit:
                    grossProfit,

                total_expenses:
                    totalExpenses,

                net_profit:
                    netProfit,

                cash_balance:
                    cashBalance

            }

        });


    } catch (error) {

        console.error(
            'Financial report error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'دریافت گزارش مالی انجام نشد',

            error:
                error.message

        });

    }

});


module.exports = router;