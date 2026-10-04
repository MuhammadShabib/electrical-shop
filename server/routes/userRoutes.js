const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();

const pool =
    require('../config/database');


/* =====================================================
   نقش‌های مجاز
===================================================== */

const validRoles = [
    'admin',
    'seller',
    'accountant'
];


/* =====================================================
   دریافت لیست کاربران
===================================================== */

router.get('/', async (req, res) => {

    try {

        const [rows] =
            await pool.query(
                `
                SELECT
                    id,
                    name,
                    username,
                    role,
                    status,
                    created_at
                FROM users
                ORDER BY id DESC
                `
            );


        res.json({

            success: true,

            data: rows

        });

    } catch (error) {

        console.error(
            'Get users error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'دریافت کاربران انجام نشد',

            error:
                error.message

        });

    }

});


/* =====================================================
   ایجاد کاربر جدید
===================================================== */

router.post('/', async (req, res) => {

    try {

        const {
            name,
            username,
            password,
            role,
            status
        } = req.body;


        const finalName =
            String(name || '').trim();

        const finalUsername =
            String(username || '').trim();

        const finalPassword =
            String(password || '');

        const finalRole =
            role || 'seller';

        const finalStatus =
            Number(status) === 0 ? 0 : 1;


        if (!finalName) {

            return res.status(400).json({

                success: false,

                message:
                    'نام کاربر الزامی است'

            });

        }


        if (!finalUsername) {

            return res.status(400).json({

                success: false,

                message:
                    'نام کاربری الزامی است'

            });

        }


        if (finalUsername.length < 3) {

            return res.status(400).json({

                success: false,

                message:
                    'نام کاربری باید حداقل ۳ حرف باشد'

            });

        }


        if (finalPassword.length < 6) {

            return res.status(400).json({

                success: false,

                message:
                    'رمز عبور باید حداقل ۶ کاراکتر باشد'

            });

        }


        if (!validRoles.includes(finalRole)) {

            return res.status(400).json({

                success: false,

                message:
                    'نقش کاربر معتبر نیست'

            });

        }


        /* =========================
           بررسی نام کاربری
        ========================= */

        const [existingRows] =
            await pool.query(
                `
                SELECT
                    id
                FROM users
                WHERE username = ?
                LIMIT 1
                `,
                [
                    finalUsername
                ]
            );


        if (
            existingRows.length > 0
        ) {

            return res.status(409).json({

                success: false,

                message:
                    'این نام کاربری قبلاً استفاده شده است'

            });

        }


        /* =========================
           هش کردن رمز
        ========================= */

        const hashedPassword =
            await bcrypt.hash(
                finalPassword,
                10
            );


        /* =========================
           ثبت کاربر
        ========================= */

        const [result] =
            await pool.query(
                `
                INSERT INTO users
                (
                    name,
                    username,
                    password,
                    role,
                    status
                )
                VALUES (?, ?, ?, ?, ?)
                `,
                [
                    finalName,
                    finalUsername,
                    hashedPassword,
                    finalRole,
                    finalStatus
                ]
            );


        res.status(201).json({

            success: true,

            message:
                'کاربر با موفقیت ایجاد شد',

            data: {

                id:
                    result.insertId,

                name:
                    finalName,

                username:
                    finalUsername,

                role:
                    finalRole,

                status:
                    finalStatus

            }

        });

    } catch (error) {

        console.error(
            'Create user error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'ایجاد کاربر انجام نشد',

            error:
                error.message

        });

    }

});


/* =====================================================
   ویرایش اطلاعات کاربر
===================================================== */

router.put('/:id', async (req, res) => {

    try {

        const userId =
            Number(req.params.id);


        if (!userId) {

            return res.status(400).json({

                success: false,

                message:
                    'شناسه کاربر معتبر نیست'

            });

        }


        const {
            name,
            username,
            role,
            status
        } = req.body;


        const finalName =
            String(name || '').trim();

        const finalUsername =
            String(username || '').trim();

        const finalRole =
            role || 'seller';

        const finalStatus =
            Number(status) === 0 ? 0 : 1;


        if (!finalName) {

            return res.status(400).json({

                success: false,

                message:
                    'نام کاربر الزامی است'

            });

        }


        if (!finalUsername) {

            return res.status(400).json({

                success: false,

                message:
                    'نام کاربری الزامی است'

            });

        }


        if (!validRoles.includes(finalRole)) {

            return res.status(400).json({

                success: false,

                message:
                    'نقش کاربر معتبر نیست'

            });

        }


        /* =========================
           بررسی وجود کاربر
        ========================= */

        const [userRows] =
            await pool.query(
                `
                SELECT
                    id
                FROM users
                WHERE id = ?
                LIMIT 1
                `,
                [
                    userId
                ]
            );


        if (
            userRows.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    'کاربر پیدا نشد'

            });

        }


        /* =========================
           بررسی تکراری نبودن username
        ========================= */

        const [usernameRows] =
            await pool.query(
                `
                SELECT
                    id
                FROM users
                WHERE username = ?
                  AND id <> ?
                LIMIT 1
                `,
                [
                    finalUsername,
                    userId
                ]
            );


        if (
            usernameRows.length > 0
        ) {

            return res.status(409).json({

                success: false,

                message:
                    'این نام کاربری قبلاً استفاده شده است'

            });

        }


        /* =========================
           بروزرسانی
        ========================= */

        await pool.query(
            `
            UPDATE users
            SET
                name = ?,
                username = ?,
                role = ?,
                status = ?
            WHERE id = ?
            `,
            [
                finalName,
                finalUsername,
                finalRole,
                finalStatus,
                userId
            ]
        );


        res.json({

            success: true,

            message:
                'اطلاعات کاربر با موفقیت ویرایش شد'

        });

    } catch (error) {

        console.error(
            'Update user error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'ویرایش کاربر انجام نشد',

            error:
                error.message

        });

    }

});


/* =====================================================
   تغییر رمز عبور
===================================================== */

router.put('/:id/password', async (req, res) => {

    try {

        const userId =
            Number(req.params.id);


        const newPassword =
            String(
                req.body.password || ''
            );


        if (!userId) {

            return res.status(400).json({

                success: false,

                message:
                    'شناسه کاربر معتبر نیست'

            });

        }


        if (
            newPassword.length < 6
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'رمز عبور باید حداقل ۶ کاراکتر باشد'

            });

        }


        const [rows] =
            await pool.query(
                `
                SELECT
                    id
                FROM users
                WHERE id = ?
                LIMIT 1
                `,
                [
                    userId
                ]
            );


        if (rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    'کاربر پیدا نشد'

            });

        }


        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );


        await pool.query(
            `
            UPDATE users
            SET
                password = ?
            WHERE id = ?
            `,
            [
                hashedPassword,
                userId
            ]
        );


        res.json({

            success: true,

            message:
                'رمز عبور با موفقیت تغییر کرد'

        });

    } catch (error) {

        console.error(
            'Change password error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'تغییر رمز عبور انجام نشد',

            error:
                error.message

        });

    }

});


/* =====================================================
   فعال / غیرفعال کردن کاربر
===================================================== */

router.put('/:id/status', async (req, res) => {

    try {

        const userId =
            Number(req.params.id);


        const newStatus =
            Number(
                req.body.status
            ) === 0 ? 0 : 1;


        if (!userId) {

            return res.status(400).json({

                success: false,

                message:
                    'شناسه کاربر معتبر نیست'

            });

        }


        const [result] =
            await pool.query(
                `
                UPDATE users
                SET
                    status = ?
                WHERE id = ?
                `,
                [
                    newStatus,
                    userId
                ]
            );


        if (
            result.affectedRows === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    'کاربر پیدا نشد'

            });

        }


        res.json({

            success: true,

            message:
                newStatus === 1
                    ? 'کاربر فعال شد'
                    : 'کاربر غیرفعال شد'

        });

    } catch (error) {

        console.error(
            'Change user status error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'تغییر وضعیت کاربر انجام نشد',

            error:
                error.message

        });

    }

});


/* =====================================================
   حذف کاربر
===================================================== */

router.delete('/:id', async (req, res) => {

    try {

        const userId =
            Number(req.params.id);


        if (!userId) {

            return res.status(400).json({

                success: false,

                message:
                    'شناسه کاربر معتبر نیست'

            });

        }


        const [result] =
            await pool.query(
                `
                DELETE FROM users
                WHERE id = ?
                `,
                [
                    userId
                ]
            );


        if (
            result.affectedRows === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    'کاربر پیدا نشد'

            });

        }


        res.json({

            success: true,

            message:
                'کاربر با موفقیت حذف شد'

        });

    } catch (error) {

        console.error(
            'Delete user error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'حذف کاربر انجام نشد',

            error:
                error.message

        });

    }

});


module.exports = router;