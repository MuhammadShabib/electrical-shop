const express = require('express');
const router = express.Router();

const pool = require('../config/database');


/* =====================================================
   ثبت خرید
===================================================== */

router.post('/', async (req, res) => {

    const connection = await pool.getConnection();

    try {

        const {
            supplier_id,
            paid_amount,
            description,
            items
        } = req.body;


        /* =========================
           بررسی اقلام خرید
        ========================= */

        if (!Array.isArray(items) || items.length === 0) {

            return res.status(400).json({
                success: false,
                message: 'حداقل یک دوا باید در خرید وجود داشته باشد'
            });

        }


        const paidAmount =
            Number(paid_amount) || 0;


        if (paidAmount < 0) {

            return res.status(400).json({
                success: false,
                message: 'مبلغ پرداختی نمی‌تواند منفی باشد'
            });

        }


        /* =========================
           شروع Transaction
        ========================= */

        await connection.beginTransaction();


        /* =========================
           بررسی شرکت
        ========================= */

        let supplierId = null;


        if (
            supplier_id !== undefined &&
            supplier_id !== null &&
            supplier_id !== ''
        ) {

            const [suppliers] =
                await connection.query(
                    `
                    SELECT id
                    FROM suppliers
                    WHERE id = ?
                    FOR UPDATE
                    `,
                    [supplier_id]
                );


            if (suppliers.length === 0) {

                throw new Error(
                    'شرکت پیدا نشد'
                );

            }


            supplierId =
                suppliers[0].id;

        }


        /* =========================
           بررسی دواها
        ========================= */

        const purchaseItems = [];

        let totalAmount = 0;


        for (const item of items) {

            const productId =
                Number(item.product_id);

            const quantity =
                Number(item.quantity);

           const purchasePrice =
    Number(item.purchase_price);

const batchNumber =
    String(
        item.batch_number || ''
    ).trim();

const expiryDate =
    item.expiry_date || '';

const salePrice =
    Number(item.sale_price) || 0;

      if (
    !productId ||
    quantity <= 0 ||
    purchasePrice < 0 ||
    Number.isNaN(purchasePrice)
) {

    throw new Error(
        'اطلاعات یکی از دواها نادرست است'
    );

}


if (!batchNumber) {

    throw new Error(
        'شماره بچ برای خرید دارو الزامی است'
    );

}


if (!expiryDate) {

    throw new Error(
        'تاریخ انقضای بچ الزامی است'
    );

}

            /* قفل دوا */

            const [products] =
                await connection.query(
                    `
                 SELECT
    id,
    name,
    sale_price,
    status
FROM products
                    WHERE id = ?
                    FOR UPDATE
                    `,
                    [productId]
                );


            if (products.length === 0) {

                throw new Error(
                    `دوا با شناسه ${productId} پیدا نشد`
                );

            }


            const product =
                products[0];


            if (product.status !== 1) {

                throw new Error(
                    `دوای "${product.name}" غیرفعال است`
                );

            }


            const itemTotal =
                quantity * purchasePrice;


            totalAmount +=
                itemTotal;


          purchaseItems.push({

    product_id:
        product.id,

    product_name:
        product.name,

    batch_number:
        batchNumber,

    expiry_date:
        expiryDate,

    quantity:
        quantity,

    purchase_price:
        purchasePrice,

    sale_price:
        salePrice > 0
            ? salePrice
            : Number(product.sale_price),

    total_price:
        itemTotal

});

        }


        /* =========================
           بررسی مبلغ پرداختی
        ========================= */

        if (paidAmount > totalAmount) {

            throw new Error(
                'مبلغ پرداختی نمی‌تواند بیشتر از مبلغ خرید باشد'
            );

        }


        const remainingAmount =
            totalAmount - paidAmount;


        /* =========================
           ساخت شماره خرید
        ========================= */

        const [lastPurchase] =
            await connection.query(
                `
                SELECT id
                FROM purchases
                ORDER BY id DESC
                LIMIT 1
                FOR UPDATE
                `
            );


        let nextNumber = 1;


        if (lastPurchase.length > 0) {

            nextNumber =
                Number(lastPurchase[0].id) + 1;

        }


        const invoiceNumber =
            `PUR-${String(nextNumber).padStart(6, '0')}`;


        /* =========================
           ثبت خرید
        ========================= */

        const [purchaseResult] =
            await connection.query(
                `
                INSERT INTO purchases
                (
                    invoice_number,
                    supplier_id,
                    total_amount,
                    paid_amount,
                    remaining_amount,
                    description
                )
                VALUES (?, ?, ?, ?, ?, ?)
                `,
                [

                    invoiceNumber,

                    supplierId,

                    totalAmount,

                    paidAmount,

                    remainingAmount,

                    description || null

                ]
            );


        const purchaseId =
            purchaseResult.insertId;


        /* =========================
           ثبت اقلام خرید
        ========================= */

        for (const item of purchaseItems) {

            /* =========================
   ایجاد / بروزرسانی بچ
========================= */

let batchId = null;


/* پیدا کردن بچ موجود */

const [existingBatches] =
    await connection.query(
        `
        SELECT
            id,
            expiry_date,
            quantity
        FROM medicine_batches
        WHERE product_id = ?
          AND batch_number = ?
        LIMIT 1
        FOR UPDATE
        `,
        [
            item.product_id,
            item.batch_number
        ]
    );


if (
    existingBatches.length > 0
) {

    const existingBatch =
        existingBatches[0];


    const existingExpiry =
        new Date(
            existingBatch.expiry_date
        )
            .toISOString()
            .split('T')[0];


    if (
        existingExpiry !==
        item.expiry_date
    ) {

        throw new Error(
            `شماره بچ "${item.batch_number}" قبلاً با تاریخ انقضای دیگری ثبت شده است`
        );

    }


    await connection.query(
        `
        UPDATE medicine_batches
        SET
            quantity = quantity + ?,
            purchase_price = ?,
            sale_price = ?,
            status = 1
        WHERE id = ?
        `,
        [
            item.quantity,
            item.purchase_price,
            item.sale_price,
            existingBatch.id
        ]
    );


    batchId =
        existingBatch.id;

}

else {

    const [batchResult] =
        await connection.query(
            `
            INSERT INTO medicine_batches
            (
                product_id,
                batch_number,
                expiry_date,
                quantity,
                purchase_price,
                sale_price,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, 1)
            `,
            [
                item.product_id,
                item.batch_number,
                item.expiry_date,
                item.quantity,
                item.purchase_price,
                item.sale_price
            ]
        );


    batchId =
        batchResult.insertId;

}
            await connection.query(
                `
               INSERT INTO purchase_items
(
    purchase_id,
    product_id,
    batch_id,
    quantity,
    purchase_price,
    total_price
)
VALUES (?, ?, ?, ?, ?, ?)
                `,
               [
    purchaseId,
    item.product_id,
    batchId,
    item.quantity,
    item.purchase_price,
    item.total_price
]
            );


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
               ثبت گردش موجودی
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
                VALUES (?, 'purchase', ?, ?, ?)
                `,
                [

                    item.product_id,

                    item.quantity,

                    purchaseId,

                    `خرید در فاکتور ${invoiceNumber}`

                ]
            );

        }


        /* =========================
           ثبت پرداخت شرکت
           
           فقط اگر شرکت و پرداخت
           بیشتر از صفر باشد.
        ========================= */

       if (paidAmount > 0) {

    /* =========================
       ثبت پرداخت شرکت
    ========================= */

    if (supplierId) {

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
                supplierId,
                paidAmount,
                `پرداخت خرید ${invoiceNumber}`
            ]
        );

    }


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
            description
        )
        VALUES ('purchase', ?, ?, ?)
        `,
        [
            paidAmount,
            purchaseId,
            `پرداخت نقدی خرید ${invoiceNumber}`
        ]
    );

}


        /* =========================
           پایان Transaction
        ========================= */

        await connection.commit();


        res.status(201).json({

            success: true,

            message:
                'خرید با موفقیت ثبت شد',

            data: {

                purchase_id:
                    purchaseId,

                invoice_number:
                    invoiceNumber,

                total_amount:
                    totalAmount,

                paid_amount:
                    paidAmount,

                remaining_amount:
                    remainingAmount

            }

        });


    } catch (error) {

        await connection.rollback();

        console.error(error);


        res.status(400).json({

            success: false,

            message:
                error.message ||
                'خطا در ثبت خرید'

        });

    } finally {

        connection.release();

    }

});


/* =====================================================
   دریافت یک خرید
===================================================== */

router.get('/:id', async (req, res) => {

    try {

        const { id } =
            req.params;


        const [purchases] =
            await pool.query(
                `
                SELECT
                    p.*,
                    s.name AS supplier_name,
                    s.phone AS supplier_phone
                FROM purchases p

                LEFT JOIN suppliers s
                    ON s.id = p.supplier_id

                WHERE p.id = ?
                `,
                [id]
            );


        if (purchases.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    'خرید پیدا نشد'

            });

        }


        const purchase =
            purchases[0];


        const [items] =
            await pool.query(
                `
                SELECT
    pi.id,
    pi.product_id,
    pi.batch_id,
    pi.quantity,
    pi.purchase_price,
    pi.total_price,

    mb.batch_number,
    mb.expiry_date,

    pr.code AS product_code,
    pr.name AS product_name,
    pr.unit AS product_unit

FROM purchase_items pi

INNER JOIN products pr
    ON pr.id = pi.product_id

LEFT JOIN medicine_batches mb
    ON mb.id = pi.batch_id

WHERE pi.purchase_id = ?

ORDER BY pi.id ASC
                `,
                [id]
            );


        res.json({

            success: true,

            data: {

                purchase:
                    purchase,

                items:
                    items

            }

        });


    } catch (error) {

        console.error(error);


        res.status(500).json({

            success: false,

            message:
                'خطا در دریافت خرید'

        });

    }

});


/* =====================================================
   لیست خریدها
===================================================== */

router.get('/', async (req, res) => {

    try {

        const [rows] =
            await pool.query(
                `
                SELECT

                    p.id,

                    p.invoice_number,

                    p.supplier_id,

                    s.name AS supplier_name,

                    p.total_amount,

                    p.paid_amount,

                    p.remaining_amount,

                    p.purchase_date,

                    p.description

                FROM purchases p

                LEFT JOIN suppliers s
                    ON s.id = p.supplier_id

                ORDER BY p.id DESC
                `
            );


        res.json({

            success: true,

            data:
                rows

        });


    } catch (error) {

        console.error(error);


        res.status(500).json({

            success: false,

            message:
                'خطا در دریافت خریدها'

        });

    }

});


module.exports = router;