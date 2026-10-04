const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();

const pool =
    require('../config/database');


/* =====================================================
   ورود به سیستم
===================================================== */

router.post('/login', async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body;


        const finalUsername =
            String(username || '').trim();

        const finalPassword =
            String(password || '');


        if (!finalUsername) {

            return res.status(400).json({

                success: false,

                message:
                    'نام کاربری را وارد کنید'

            });

        }


        if (!finalPassword) {

            return res.status(400).json({

                success: false,

                message:
                    'رمز عبور را وارد کنید'

            });

        }


        /* =========================
           پیدا کردن کاربر
        ========================= */

        const [rows] =
            await pool.query(
                `
                SELECT
                    id,
                    name,
                    username,
                    password,
                    role,
                    status
                FROM users
                WHERE username = ?
                LIMIT 1
                `,
                [
                    finalUsername
                ]
            );


        if (
            rows.length === 0
        ) {

            return res.status(401).json({

                success: false,

                message:
                    'نام کاربری یا رمز عبور نادرست است'

            });

        }


        const user =
            rows[0];


        /* =========================
           بررسی وضعیت کاربر
        ========================= */

        if (
            Number(user.status) !== 1
        ) {

            return res.status(403).json({

                success: false,

                message:
                    'این کاربر غیرفعال است'

            });

        }


        /* =========================
           بررسی رمز
        ========================= */

        const passwordMatch =
            await bcrypt.compare(
                finalPassword,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    'نام کاربری یا رمز عبور نادرست است'

            });

        }


        /* =========================
           ساخت Session
        ========================= */

        req.session.user = {

            id:
                user.id,

            name:
                user.name,

            username:
                user.username,

            role:
                user.role

        };


        res.json({

            success: true,

            message:
                'ورود با موفقیت انجام شد',

            data: {

                id:
                    user.id,

                name:
                    user.name,

                username:
                    user.username,

                role:
                    user.role

            }

        });

    } catch (error) {

        console.error(
            'Login error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'ورود به سیستم انجام نشد',

            error:
                error.message

        });

    }

});


/* =====================================================
   دریافت کاربر واردشده
===================================================== */

router.get('/me', (req, res) => {

    if (
        !req.session ||
        !req.session.user
    ) {

        return res.status(401).json({

            success: false,

            message:
                'کاربر وارد سیستم نشده است'

        });

    }


    res.json({

        success: true,

        data:
            req.session.user

    });

});


/* =====================================================
   خروج
===================================================== */

router.post('/logout', (req, res) => {

    req.session.destroy(
        error => {

            if (error) {

                console.error(
                    'Logout error:',
                    error
                );


                return res.status(500).json({

                    success: false,

                    message:
                        'خروج از سیستم انجام نشد'

                });

            }


            res.clearCookie(
                'connect.sid'
            );


            res.json({

                success: true,

                message:
                    'با موفقیت از سیستم خارج شدید'

            });

        }
    );

});


module.exports = router;