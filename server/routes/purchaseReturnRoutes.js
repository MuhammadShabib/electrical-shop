const express = require('express');
const router = express.Router();

const pool = require('../config/database');


/* =====================================================
   ثبت برگشت خرید به شرکت
===================================================== */

router.post('/', async (req, res) => {

    const connection =
        await pool.getConnection();

    try {

        const {
            purchase_id,
            description,
            items
        } = req.body;


        /* =========================
           بررسی خرید
        ========================= */

        const purchaseId =
            Number(purchase_id);


        if (!purchaseId) {

            return res.status(400).json({

                success: false,

                message:
                    'شناسه خرید معتبر نیست'

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
           دریافت خرید
        ========================= */

        const [purchases] =
            await connection.query(
                `
                SELECT
                    id,
                    supplier_id,
                    invoice_number
                FROM purchases
                WHERE id = ?
                FOR UPDATE
                `,
                [purchaseId]
            );


        if (purchases.length === 0) {

            throw new Error(
                'خرید پیدا نشد'
            );

        }


        const purchase =
            purchases[0];


        let totalAmount = 0;

        const returnItems = [];


        /* =========================
           بررسی اقلام برگشت
        ========================= */

        for (const item of items) {

            const purchaseItemId =
                Number(
                    item.purchase_item_id
                );

            const quantity =
                Number(
                    item.quantity
                );


            if (
                !purchaseItemId ||
                quantity <= 0
            ) {

                throw new Error(
                    'اطلاعات یکی از اقلام برگشت نادرست است'
                );

            }


            /* =========================
               دریافت قلم خرید
            ========================= */

            const [purchaseItems] =
                await connection.query(
                    `
                 SELECT
    id,
    purchase_id,
    product_id,
    batch_id,
    quantity,
    purchase_price,
    total_price
FROM purchase_items
WHERE id = ?
  AND purchase_id = ?
FOR UPDATE
                    `,
                    [
                        purchaseItemId,
                        purchaseId
                    ]
                );


            if (purchaseItems.length === 0) {

                throw new Error(
                    `قلم خرید ${purchaseItemId} پیدا نشد`
                );

            }


            const purchaseItem =
                purchaseItems[0];


            /* =========================
               جلوگیری از برگشت بیشتر
               از مقدار خرید
            ========================= */

            const [returnedRows] =
                await connection.query(
                    `
                    SELECT
                        COALESCE(
                            SUM(quantity),
                            0
                        ) AS returned_quantity
                    FROM purchase_return_items
                    WHERE purchase_item_id = ?
                    `,
                    [purchaseItemId]
                );


            const alreadyReturned =
                Number(
                    returnedRows[0]
                        .returned_quantity
                ) || 0;


            const availableQuantity =
                Number(
                    purchaseItem.quantity
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


            /* =========================
               دریافت و قفل دوا
            ========================= */

            const [products] =
                await connection.query(
                    `
                    SELECT
                        id,
                        name,
                        stock
                    FROM products
                    WHERE id = ?
                    FOR UPDATE
                    `,
                    [
                        purchaseItem.product_id
                    ]
                );


            if (products.length === 0) {

                throw new Error(
                    'دوا پیدا نشد'
                );

            }


            const product =
                products[0];


            /* =========================
               بررسی موجودی
            ========================= */

            if (
                Number(product.stock) <
                quantity
            ) {

                throw new Error(
                    `موجودی دوای "${product.name}" برای برگشت کافی نیست`
                );

            }


            const itemTotal =
                quantity *
                Number(
                    purchaseItem.purchase_price
                );


            totalAmount +=
                itemTotal;


           returnItems.push({

    purchase_item_id:
        purchaseItem.id,

    product_id:
        purchaseItem.product_id,

    batch_id:
        purchaseItem.batch_id,

    quantity,

    purchase_price:
        Number(
            purchaseItem.purchase_price
        ),

    total_price:
        itemTotal

});

        }


        /* =========================
           ثبت برگشت
        ========================= */

        const [returnResult] =
            await connection.query(
                `
                INSERT INTO purchase_returns
                (
                    purchase_id,
                    supplier_id,
                    total_amount,
                    description
                )
                VALUES (?, ?, ?, ?)
                `,
                [
                    purchaseId,
                    purchase.supplier_id,
                    totalAmount,
                    description || null
                ]
            );


        const returnId =
            returnResult.insertId;


        /* =========================
           ثبت اقلام + کاهش موجودی
           + گردش انبار
        ========================= */

        for (const item of returnItems) {

           await connection.query(
    `
    INSERT INTO purchase_return_items
    (
        return_id,
        purchase_item_id,
        product_id,
        batch_id,
        quantity,
        purchase_price,
        total_price
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
        returnId,
        item.purchase_item_id,
        item.product_id,
        item.batch_id,
        item.quantity,
        item.purchase_price,
        item.total_price
    ]
);

/* =========================
   کاهش موجودی همان بچ
========================= */

if (item.batch_id) {

    const [batchUpdate] =
        await connection.query(
            `
            UPDATE medicine_batches
            SET
                quantity = quantity - ?
            WHERE id = ?
              AND quantity >= ?
            `,
            [
                item.quantity,
                item.batch_id,
                item.quantity
            ]
        );


    if (
        batchUpdate.affectedRows === 0
    ) {

        throw new Error(
            'موجودی بچ برای برگشت کافی نیست'
        );

    }

}

            /* =========================
               کاهش موجودی
            ========================= */

            await connection.query(
                `
                UPDATE products
                SET stock = stock - ?
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
                    'return_purchase',
                    ?,
                    ?,
                    ?
                )
                `,
                [
                    item.product_id,

                    item.quantity,

                    returnId,

                    `برگشت خرید ${purchase.invoice_number}`
                ]
            );

        }


        /* =========================
           کاهش بدهی شرکت
        ========================= */

        if (
            purchase.supplier_id &&
            totalAmount > 0
        ) {

            await connection.query(
                `
                INSERT INTO supplier_payments
                (
                    supplier_id,
                    amount,
                    payment_method,
                    description
                )
                VALUES (?, ?, 'cash', ?)
                `,
                [
                    purchase.supplier_id,

                    totalAmount,

                    `برگشت دوا از خرید ${purchase.invoice_number}`
                ]
            );

        }


        await connection.commit();


        res.status(201).json({

            success: true,

            message:
                'برگشت خرید با موفقیت ثبت شد',

            data: {

                return_id:
                    returnId,

                purchase_id:
                    purchaseId,

                total_amount:
                    totalAmount

            }

        });


    } catch (error) {

        await connection.rollback();


        console.error(
            'Purchase return error:',
            error
        );


        res.status(400).json({

            success: false,

            message:
                error.message ||
                'ثبت برگشت خرید انجام نشد'

        });

    } finally {

        connection.release();

    }

});


module.exports = router;