const express = require('express');

const router = express.Router();

const pool =
    require('../config/database');

const {
    requireAuth,
    requireRole
} = require('../middleware/authMiddleware');


/* =====================================================
   دریافت بچ‌های یک دارو
   GET /api/batches/product/:productId
===================================================== */

router.get(
    '/product/:productId',
    requireAuth,
    async (req, res) => {

        try {

            const productId =
                Number(req.params.productId);


            if (!productId) {

                return res.status(400).json({
                    success: false,
                    message: 'شناسه دارو معتبر نیست'
                });

            }


            const [rows] =
                await pool.query(
                    `
                    SELECT
                        id,
                        product_id,
                        batch_number,
                        expiry_date,
                        quantity,
                        purchase_price,
                        sale_price,
                        status,
                        created_at
                    FROM medicine_batches
                    WHERE product_id = ?
                    ORDER BY expiry_date ASC, id ASC
                    `,
                    [productId]
                );


            res.json({

                success: true,

                data: rows

            });

        } catch (error) {

            console.error(
                'Get batches error:',
                error
            );


            res.status(500).json({

                success: false,

                message:
                    'دریافت بچ‌های دارو انجام نشد',

                error:
                    error.message

            });

        }

    }
);


/* =====================================================
   ثبت بچ جدید
   فقط admin و accountant
   POST /api/batches
===================================================== */

router.post(
    '/',
    requireRole(
        'admin',
        'accountant'
    ),
    async (req, res) => {

        try {

            const {
                product_id,
                batch_number,
                expiry_date,
                quantity,
                purchase_price,
                sale_price
            } = req.body;


            const productId =
                Number(product_id);

            const batchNumber =
                String(
                    batch_number || ''
                ).trim();

            const batchQuantity =
                Number(quantity);

            const purchasePrice =
                Number(purchase_price) || 0;

            const salePrice =
                Number(sale_price) || 0;


            /* =========================
               اعتبارسنجی
            ========================= */

            if (!productId) {

                return res.status(400).json({

                    success: false,

                    message:
                        'دارو انتخاب نشده است'

                });

            }


            if (!batchNumber) {

                return res.status(400).json({

                    success: false,

                    message:
                        'شماره بچ الزامی است'

                });

            }


            if (!expiry_date) {

                return res.status(400).json({

                    success: false,

                    message:
                        'تاریخ انقضا الزامی است'

                });

            }


            if (
                !Number.isFinite(batchQuantity) ||
                batchQuantity <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'مقدار بچ باید بیشتر از صفر باشد'

                });

            }


            if (
                purchasePrice < 0 ||
                salePrice < 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'قیمت نمی‌تواند منفی باشد'

                });

            }


            /* =========================
               بررسی دارو
            ========================= */

            const [products] =
                await pool.query(
                    `
                    SELECT
                        id,
                        name
                    FROM products
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [productId]
                );


            if (products.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        'دارو پیدا نشد'

                });

            }


            /* =========================
               ثبت بچ
            ========================= */

            const [result] =
                await pool.query(
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
                        productId,
                        batchNumber,
                        expiry_date,
                        batchQuantity,
                        purchasePrice,
                        salePrice
                    ]
                );


            /* =========================
               بروزرسانی موجودی دارو
            ========================= */

            await pool.query(
                `
                UPDATE products
                SET
                    stock = stock + ?
                WHERE id = ?
                `,
                [
                    batchQuantity,
                    productId
                ]
            );


            res.status(201).json({

                success: true,

                message:
                    'بچ دارو با موفقیت ثبت شد',

                data: {

                    id:
                        result.insertId,

                    product_id:
                        productId,

                    batch_number:
                        batchNumber,

                    expiry_date:
                        expiry_date,

                    quantity:
                        batchQuantity

                }

            });

        } catch (error) {

            console.error(
                'Create batch error:',
                error
            );


            res.status(500).json({

                success: false,

                message:
                    'ثبت بچ دارو انجام نشد',

                error:
                    error.message

            });

        }

    }
);


/* =====================================================
   فعال / غیرفعال کردن بچ
   فقط admin و accountant
   PUT /api/batches/:id/status
===================================================== */

router.put(
    '/:id/status',
    requireRole(
        'admin',
        'accountant'
    ),
    async (req, res) => {

        try {

            const batchId =
                Number(req.params.id);

            const newStatus =
                Number(req.body.status) === 1
                    ? 1
                    : 0;


            if (!batchId) {

                return res.status(400).json({

                    success: false,

                    message:
                        'شناسه بچ معتبر نیست'

                });

            }


            const [result] =
                await pool.query(
                    `
                    UPDATE medicine_batches
                    SET
                        status = ?
                    WHERE id = ?
                    `,
                    [
                        newStatus,
                        batchId
                    ]
                );


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        'بچ پیدا نشد'

                });

            }


            res.json({

                success: true,

                message:
                    newStatus === 1
                        ? 'بچ فعال شد'
                        : 'بچ غیرفعال شد'

            });

        } catch (error) {

            console.error(
                'Change batch status error:',
                error
            );


            res.status(500).json({

                success: false,

                message:
                    'تغییر وضعیت بچ انجام نشد',

                error:
                    error.message

            });

        }

    }
);

/* =====================================================
   دواهای نزدیک به تاریخ انقضا
   GET /api/batches/expiring
===================================================== */

router.get(
    '/expiring',
    requireAuth,
    async (req, res) => {

        try {

          const days =
    Number(req.query.days);

if (
    !Number.isInteger(days) ||
    days <= 0
) {

    return res.status(400).json({
        success: false,
        message:
            'تعداد روز باید یک عدد صحیح بیشتر از صفر باشد'
    });

}

            const [rows] =
                await pool.query(
                    `
                    SELECT
                        mb.id,
                        mb.product_id,
                        mb.batch_number,
                        mb.expiry_date,
                        mb.quantity,
                        mb.status,

                        p.code,
                        p.name,
                        p.unit

                    FROM medicine_batches mb

                    INNER JOIN products p
                        ON p.id = mb.product_id

                    WHERE
                        mb.quantity > 0
                        AND mb.status = 1
                        AND mb.expiry_date <=
                            DATE_ADD(
                                CURDATE(),
                                INTERVAL ? DAY
                            )

                    ORDER BY
                        mb.expiry_date ASC
                    `,
                    [days]
                );


            res.json({

                success: true,

                data: rows

            });

        } catch (error) {

            console.error(
                'Expiring batches error:',
                error
            );


            res.status(500).json({

                success: false,

                message:
                    'دریافت دواهای نزدیک به تاریخ انقضا انجام نشد',

                error:
                    error.message

            });

        }

    }
);


module.exports = router;