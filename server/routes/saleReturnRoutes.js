const express = require('express');
const router = express.Router();

const pool = require('../config/database');


/* =====================================================
   ثبت برگشت دوا از مشتری
===================================================== */

router.post('/', async (req, res) => {

    const connection =
        await pool.getConnection();

    try {

        const {
            sale_id,
            refund_amount,
            description,
            items
        } = req.body;


        /* =========================
           اعتبارسنجی
        ========================= */

        const saleId =
            Number(sale_id);

        const refundAmount =
            Number(refund_amount) || 0;


        if (!saleId) {

            return res.status(400).json({

                success: false,

                message:
                    'شناسه فروش معتبر نیست'

            });

        }


        if (
            refundAmount < 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'مبلغ برگشت معتبر نیست'

            });

        }


        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'حداقل یک دوا باید برای برگشت انتخاب شود'

            });

        }


        await connection.beginTransaction();


        /* =========================
           دریافت فاکتور فروش
        ========================= */

        const [sales] =
            await connection.query(
                `
                SELECT
                    id,
                    customer_id,
                    invoice_number
                FROM sales
                WHERE id = ?
                FOR UPDATE
                `,
                [saleId]
            );


        if (sales.length === 0) {

            throw new Error(
                'فاکتور فروش پیدا نشد'
            );

        }


        const sale =
            sales[0];


        const returnItems = [];

        let totalAmount = 0;


        /* =========================
           بررسی اقلام برگشت
        ========================= */

        for (const item of items) {

            const saleItemId =
                Number(
                    item.sale_item_id
                );

            const quantity =
                Number(
                    item.quantity
                );


            if (
                !saleItemId ||
                quantity <= 0
            ) {

                throw new Error(
                    'اطلاعات یکی از اقلام برگشت نادرست است'
                );

            }


            /* =========================
               دریافت قلم فروش
            ========================= */

            const [saleItems] =
                await connection.query(
                    `
                SELECT
    id,
    sale_id,
    product_id,
    batch_id,
    quantity,
    sale_price,
    purchase_price
FROM sale_items
WHERE id = ?
  AND sale_id = ?
FOR UPDATE
                    `,
                    [
                        saleItemId,
                        saleId
                    ]
                );


            if (saleItems.length === 0) {

                throw new Error(
                    `قلم فروش ${saleItemId} پیدا نشد`
                );

            }


            const saleItem =
                saleItems[0];


            /* =========================
               بررسی مقدار برگشتی قبلی
            ========================= */

            const [returnedRows] =
                await connection.query(
                    `
                    SELECT
                        COALESCE(
                            SUM(quantity),
                            0
                        ) AS returned_quantity
                    FROM sale_return_items
                    WHERE sale_item_id = ?
                    `,
                    [saleItemId]
                );


            const alreadyReturned =
                Number(
                    returnedRows[0]
                        .returned_quantity
                ) || 0;


            const availableQuantity =
                Number(
                    saleItem.quantity
                ) -
                alreadyReturned;


            if (
                quantity >
                availableQuantity
            ) {

                throw new Error(
                    `مقدار قابل برگشت این دوا فقط ${availableQuantity} است`
                );

            }


            const itemTotal =
                quantity *
                Number(
                    saleItem.sale_price
                );


            totalAmount +=
                itemTotal;


          returnItems.push({

    sale_item_id:
        saleItem.id,

    product_id:
        saleItem.product_id,

    batch_id:
        saleItem.batch_id,

    quantity,

    sale_price:
        Number(
            saleItem.sale_price
        ),

    purchase_price:
        Number(
            saleItem.purchase_price
        ),

    total_price:
        itemTotal

});

        }


        /* =========================
           بررسی مبلغ بازپرداخت
        ========================= */

        if (
            refundAmount >
            totalAmount
        ) {

            throw new Error(
                'مبلغ بازپرداخت نمی‌تواند بیشتر از مبلغ برگشت دوا باشد'
            );

        }


        /* =========================
           ثبت برگشت
        ========================= */

        const [returnResult] =
            await connection.query(
                `
                INSERT INTO sale_returns
                (
                    sale_id,
                    customer_id,
                    total_amount,
                    refund_amount,
                    description
                )
                VALUES (?, ?, ?, ?, ?)
                `,
                [
                    saleId,

                    sale.customer_id,

                    totalAmount,

                    refundAmount,

                    description || null
                ]
            );


        const returnId =
            returnResult.insertId;


        /* =========================
           ثبت اقلام برگشت
           + افزایش موجودی
           + گردش انبار
        ========================= */

        for (const item of returnItems) {

           await connection.query(
    `
    INSERT INTO sale_return_items
    (
        return_id,
        sale_item_id,
        product_id,
        batch_id,
        quantity,
        sale_price,
        purchase_price,
        total_price
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
        returnId,
        item.sale_item_id,
        item.product_id,
        item.batch_id,
        item.quantity,
        item.sale_price,
        item.purchase_price,
        item.total_price
    ]
);

/* =========================
   افزایش موجودی همان بچ
========================= */

if (item.batch_id) {

    const [batchUpdate] =
        await connection.query(
            `
            UPDATE medicine_batches
            SET
                quantity = quantity + ?
            WHERE id = ?
            `,
            [
                item.quantity,
                item.batch_id
            ]
        );


    if (
        batchUpdate.affectedRows === 0
    ) {

        throw new Error(
            'بچ مربوط به این فروش پیدا نشد'
        );

    }

}

            /* =========================
               افزایش موجودی
            ========================= */

            await connection.query(
                `
                UPDATE products
                SET stock = stock + ?
                WHERE id = ?
                `,
                [
                    item.quantity,
                    item.product_id
                ]
            );


            /* =========================
               ثبت گردش انبار
            ========================= */

            await connection.query(
                `
                INSERT INTO stock_movements
                (
                    product_id,
                    type,
                    quantity,
                    reference_id,
                    description
                )
                VALUES
                (
                    ?,
                    'return_sale',
                    ?,
                    ?,
                    ?
                )
                `,
                [
                    item.product_id,

                    item.quantity,

                    returnId,

                    `برگشت فروش ${sale.invoice_number}`
                ]
            );

        }


        /* =========================
           ثبت کاهش بدهی مشتری
           در صورت فروش نسیه
        ========================= */

        if (
            sale.customer_id &&
            totalAmount > 0
        ) {

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
                VALUES (?, 'credit', ?, ?, ?, ?, NOW())
                `,
                [
                    sale.customer_id,

                    totalAmount,

                    `برگشت دوا از فاکتور ${sale.invoice_number}`,

                    'sale_return',

                    returnId

                ]
            );

        }


        /* =========================
           بازپرداخت نقدی
           فقط مبلغ واقعی refund
        ========================= */

        if (
            refundAmount > 0
        ) {

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
                    'sale_return',
                    ?,
                    ?,
                    ?,
                    NOW()
                )
                `,
                [
                    refundAmount,

                    returnId,

                    `بازپرداخت برگشت فروش ${sale.invoice_number}`
                ]
            );

        }


        await connection.commit();


        res.status(201).json({

            success: true,

            message:
                'برگشت فروش با موفقیت ثبت شد',

            data: {

                return_id:
                    returnId,

                sale_id:
                    saleId,

                total_amount:
                    totalAmount,

                refund_amount:
                    refundAmount

            }

        });


    } catch (error) {

        await connection.rollback();


        console.error(
            'Sale return error:',
            error
        );


        res.status(400).json({

            success: false,

            message:
                error.message ||
                'ثبت برگشت فروش انجام نشد'

        });

    } finally {

        connection.release();

    }

});


module.exports = router;