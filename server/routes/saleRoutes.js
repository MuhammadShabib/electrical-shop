const express = require('express');
const router = express.Router();

const pool = require('../config/database');


/* =====================================================
   ایجاد فاکتور فروش
===================================================== */

router.post('/', async (req, res) => {

    const connection = await pool.getConnection();

    try {

   const {
    customer_id,
    discount,
    paid_amount,
    description,
    items
} = req.body;

        /* =========================
           بررسی اقلام فاکتور
        ========================= */

        if (!Array.isArray(items) || items.length === 0) {

            return res.status(400).json({
                success: false,
                message: 'حداقل یک دوا باید در فاکتور وجود داشته باشد'
            });

        }


        /* =========================
           بررسی پرداخت
        ========================= */

        const discountAmount =
            Number(discount) || 0;

        const paidAmount =
            Number(paid_amount) || 0;


        if (discountAmount < 0 || paidAmount < 0) {

            return res.status(400).json({
                success: false,
                message: 'تخفیف و مبلغ پرداختی نمی‌توانند منفی باشند'
            });

        }


        /* =========================
           شروع Transaction
        ========================= */

        await connection.beginTransaction();


        /* =========================
           بررسی مشتری
        ========================= */

        let customerId = null;


        if (
            customer_id !== undefined &&
            customer_id !== null &&
            customer_id !== ''
        ) {

            const [customers] = await connection.query(
                `
                SELECT id, status
                FROM customers
                WHERE id = ?
                FOR UPDATE
                `,
                [customer_id]
            );


            if (customers.length === 0) {

                throw new Error('مشتری پیدا نشد');

            }


            if (customers[0].status !== 1) {

                throw new Error('این مشتری غیرفعال است');

            }


            customerId =
                customers[0].id;

        }


        /* =========================
           محاسبه و بررسی دواها
        ========================= */

        const saleItems = [];

        let totalAmount = 0;


        for (const item of items) {

            const productId =
                Number(item.product_id);

            const quantity =
                Number(item.quantity);

                const batchId =
    item.batch_id
        ? Number(item.batch_id)
        : null;


            if (!productId || quantity <= 0) {

                throw new Error(
                    'اطلاعات یکی از دواها نادرست است'
                );

            }


            /* دریافت دوا و قفل کردن ردیف */

            const [products] = await connection.query(
                `
                SELECT
                    id,
                    code,
                    name,
                    purchase_price,
                    sale_price,
                    stock,
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
            /* =========================
   بررسی بچ دارو
========================= */

let batch = null;

if (batchId) {

    const [batches] =
        await connection.query(
            `
            SELECT
                id,
                product_id,
                batch_number,
                expiry_date,
                quantity,
                purchase_price,
                sale_price,
                status
            FROM medicine_batches
            WHERE id = ?
              AND product_id = ?
            FOR UPDATE
            `,
            [
                batchId,
                productId
            ]
        );


    if (batches.length === 0) {

        throw new Error(
            `بچ انتخاب‌شده برای داروی "${product.name}" پیدا نشد`
        );

    }


    batch =
        batches[0];


    if (Number(batch.status) !== 1) {

        throw new Error(
            `بچ انتخاب‌شده برای داروی "${product.name}" غیرفعال است`
        );

    }


    const today =
        new Date()
            .toISOString()
            .split('T')[0];


    const expiryDate =
        new Date(
            batch.expiry_date
        )
            .toISOString()
            .split('T')[0];


    if (expiryDate < today) {

        throw new Error(
            `بچ انتخاب‌شده منقضی شده است`
        );

    }


    if (
        Number(batch.quantity) <
        quantity
    ) {

        throw new Error(
            `موجودی بچ "${batch.batch_number}" برای داروی "${product.name}" کافی نیست. موجودی بچ: ${batch.quantity}`
        );

    }

}


            /* بررسی موجودی */

            if (
                Number(product.stock) <
                quantity
            ) {

                throw new Error(
                    `موجودی دوای "${product.name}" کافی نیست. موجودی فعلی: ${product.stock}`
                );

            }


            /* قیمت فروش */

            const salePrice =
    Number(item.sale_price) > 0

        ? Number(item.sale_price)

        : batch

            ? Number(batch.sale_price)

            : Number(product.sale_price);

            if (salePrice < 0) {

                throw new Error(
                    `قیمت فروش دوای "${product.name}" نامعتبر است`
                );

            }


            const itemTotal =
                quantity * salePrice;


            totalAmount +=
                itemTotal;


            saleItems.push({

                product_id:
                    product.id,

batch_id:
    batchId,

                quantity:
                    quantity,

                sale_price:
                    salePrice,

              purchase_price:
    batch
        ? Number(batch.purchase_price)
        : Number(product.purchase_price),
                total_price:
                    itemTotal

            });

        }


        /* =========================
           محاسبه مبلغ نهایی
        ========================= */

        if (discountAmount > totalAmount) {

            throw new Error(
                'تخفیف نمی‌تواند بیشتر از مبلغ فاکتور باشد'
            );

        }


        const finalAmount =
            totalAmount - discountAmount;


        if (paidAmount > finalAmount) {

            throw new Error(
                'مبلغ پرداختی نمی‌تواند بیشتر از مبلغ نهایی فاکتور باشد'
            );

        }


        const remainingAmount =
            finalAmount - paidAmount;


        /* =========================
           ایجاد شماره فاکتور
        ========================= */

        const [lastSale] = await connection.query(
            `
            SELECT id
            FROM sales
            ORDER BY id DESC
            LIMIT 1
            FOR UPDATE
            `
        );


        let nextNumber = 1;


        if (lastSale.length > 0) {

            nextNumber =
                Number(lastSale[0].id) + 1;

        }


        const invoiceNumber =
            `INV-${String(nextNumber).padStart(6, '0')}`;


        /* =========================
           ثبت فاکتور
        ========================= */

        const [saleResult] =
            await connection.query(
                `
                INSERT INTO sales
                (
                    invoice_number,
                    customer_id,
                    total_amount,
                    discount,
                    paid_amount,
                    remaining_amount,
                    description
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [

                    invoiceNumber,

                    customerId,

                    finalAmount,

                    discountAmount,

                    paidAmount,

                    remainingAmount,

                    description || null

                ]
            );


        const saleId =
            saleResult.insertId;


        /* =========================
           ثبت اقلام فاکتور
        ========================= */

       for (const item of saleItems) {

    /* =========================
       ثبت قلم فاکتور
    ========================= */

   await connection.query(
    `
    INSERT INTO sale_items
    (
        sale_id,
        product_id,
        batch_id,
        quantity,
        sale_price,
        purchase_price,
        total_price
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
        saleId,
        item.product_id,
        item.batch_id,
        item.quantity,
        item.sale_price,
        item.purchase_price,
        item.total_price
    ]
);


/* =========================
   کاهش موجودی بچ
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
            'موجودی بچ برای ثبت فروش کافی نیست'
        );

    }

}

    /* =========================
       کاهش موجودی دوا
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
        VALUES (?, 'sale', ?, ?, ?)
        `,
        [
            item.product_id,
            item.quantity,
            saleId,
            `فروش در فاکتور ${invoiceNumber}`
        ]
    );

}

        /* =================================================
           ثبت بدهی مشتری
           
           فقط مبلغ باقی‌مانده ثبت می‌شود.
           
           مبلغ پرداختی در حساب مشتری تراکنش نمی‌سازد،
           چون پرداخت همان لحظه فروش انجام شده است.
        ================================================= */

        if (
            customerId &&
            remainingAmount > 0
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
                    reference_id
                )
                VALUES (?, 'debit', ?, ?, ?, ?)
                `,
                [

                    customerId,

                    remainingAmount,

                    `بدهی فاکتور ${invoiceNumber}`,

                    'sale',

                    saleId

                ]
            );

        }

/* =================================================
   ثبت دریافت نقدی در صندوق
================================================= */

if (paidAmount > 0) {

    await connection.query(
        `
        INSERT INTO cash_transactions
        (
            type,
            amount,
            reference_id,
            description
        )
        VALUES ('sale', ?, ?, ?)
        `,
        [
            paidAmount,
            saleId,
            `دریافت نقدی فروش ${invoiceNumber}`
        ]
    );

}
        /* =========================
           پایان Transaction
        ========================= */

        await connection.commit();


        res.status(201).json({

            success: true,

            message: 'فاکتور با موفقیت ثبت شد',

            data: {

                sale_id:
                    saleId,

                invoice_number:
                    invoiceNumber,

                total_amount:
                    totalAmount,

                discount:
                    discountAmount,

                final_amount:
                    finalAmount,

                paid_amount:
                    paidAmount,

                remaining_amount:
                    remainingAmount

            }

        });


    } catch (error) {


        /* برگشت تمام تغییرات */

        await connection.rollback();


        console.error(error);


        res.status(400).json({

            success: false,

            message:
                error.message ||
                'خطا در ثبت فاکتور'

        });


    } finally {

        connection.release();

    }

});


/* =====================================================
   دریافت فاکتور بر اساس ID
===================================================== */

router.get('/:id', async (req, res) => {

    try {

        const { id } =
            req.params;


        const [sales] =
            await pool.query(
                `
                SELECT
                    s.*,
                    c.name AS customer_name,
                    c.phone AS customer_phone
                FROM sales s

                LEFT JOIN customers c
                    ON c.id = s.customer_id

                WHERE s.id = ?
                `,
                [id]
            );


        if (sales.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    'فاکتور پیدا نشد'

            });

        }


        const sale =
            sales[0];


        const [items] =
            await pool.query(
                `
                SELECT
    si.id,
    si.product_id,
    si.batch_id,
    si.quantity,
    si.sale_price,
    si.purchase_price,
    si.total_price,

    mb.batch_number,
    mb.expiry_date,

    p.code AS product_code,
    p.name AS product_name,
    p.unit AS product_unit

FROM sale_items si

INNER JOIN products p
    ON p.id = si.product_id

LEFT JOIN medicine_batches mb
    ON mb.id = si.batch_id

WHERE si.sale_id = ?

ORDER BY si.id ASC
                `,
                [id]
            );


        res.json({

            success: true,

            data: {

                sale:
                    sale,

                items:
                    items

            }

        });


    } catch (error) {

        console.error(error);


        res.status(500).json({

            success: false,

            message:
                'خطا در دریافت فاکتور'

        });

    }

});


/* =====================================================
   دریافت لیست فاکتورها
===================================================== */

router.get('/', async (req, res) => {

    try {

        const [rows] =
            await pool.query(
                `
                SELECT

                    s.id,

                    s.invoice_number,

                    s.customer_id,

                    c.name AS customer_name,

                    s.total_amount,

                    s.discount,

                    s.paid_amount,

                    s.remaining_amount,

                    s.sale_date,

                    s.description

                FROM sales s

                LEFT JOIN customers c
                    ON c.id = s.customer_id

                ORDER BY s.id DESC
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
                'خطا در دریافت فاکتورها'

        });

    }

});


module.exports = router;