const express = require('express');

const router = express.Router();

const pool =
    require('../config/database');


/* =====================================================
   دریافت تنظیمات سیستم
===================================================== */

router.get('/', async (req, res) => {

    try {

        const [rows] =
            await pool.query(
                `
                SELECT
                    *
                FROM settings
                ORDER BY id ASC
                LIMIT 1
                `
            );


        if (rows.length === 0) {

            return res.json({

                success: true,

                data: {

                    id: null,

                    shop_name: '',
                    phone: '',
                    address: '',
                    currency: 'AFN',
                    invoice_footer: '',

                    font_family: 'Tahoma',
                    font_size: '16px',

                    primary_color: '#2563eb',
                    secondary_color: '#1e293b',
                    button_color: '#2563eb',

                    theme: 'light',

                    logo: null,
                    show_logo: 1,

                    shop_description: '',

                    show_shop_name: 1,
                    show_shop_contact: 1,

                    print_copies: 1,

                    decimal_places: 0,

                    amount_format: 'comma',

                    table_style: 'normal'

                }

            });

        }


        res.json({

            success: true,

            data: rows[0]

        });


    } catch (error) {

        console.error(
            'Get settings error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'دریافت تنظیمات انجام نشد',

            error:
                error.message

        });

    }

});


/* =====================================================
   ذخیره تنظیمات سیستم
===================================================== */

router.put('/', async (req, res) => {

    try {

        const {

            shop_name,
            phone,
            address,
            currency,
            invoice_footer,

            font_family,
            font_size,

            primary_color,
            secondary_color,
            button_color,

            theme,

            logo,
            show_logo,

            shop_description,

            show_shop_name,
            show_shop_contact,

            print_copies,

            decimal_places,

            amount_format,

            table_style

        } = req.body;


        /* =========================
           اعتبارسنجی پایه
        ========================= */

        const finalPrintCopies =
            Math.max(
                1,
                Number(
                    print_copies
                ) || 1
            );


        const finalDecimalPlaces =
            Math.max(
                0,
                Math.min(
                    4,
                    Number(
                        decimal_places
                    ) || 0
                )
            );


        const validThemes = [
            'light',
            'dark'
        ];


        const finalTheme =
            validThemes.includes(
                theme
            )
                ? theme
                : 'light';


        const validAmountFormats = [
            'comma',
            'plain'
        ];


        const finalAmountFormat =
            validAmountFormats.includes(
                amount_format
            )
                ? amount_format
                : 'comma';


        const validTableStyles = [
            'normal',
            'compact',
            'bordered'
        ];


        const finalTableStyle =
            validTableStyles.includes(
                table_style
            )
                ? table_style
                : 'normal';


        const finalShowLogo =
            Number(
                show_logo
            ) ? 1 : 0;


        const finalShowShopName =
            Number(
                show_shop_name
            ) ? 1 : 0;


        const finalShowShopContact =
            Number(
                show_shop_contact
            ) ? 1 : 0;


        /* =========================
           بررسی وجود تنظیمات
        ========================= */

        const [existingRows] =
            await pool.query(
                `
                SELECT id
                FROM settings
                ORDER BY id ASC
                LIMIT 1
                `
            );


        if (
            existingRows.length === 0
        ) {

            /* =========================
               ایجاد اولین رکورد
            ========================= */

            const [result] =
                await pool.query(
                    `
                    INSERT INTO settings
                    (
                        shop_name,
                        phone,
                        address,
                        currency,
                        invoice_footer,

                        font_family,
                        font_size,

                        primary_color,
                        secondary_color,
                        button_color,

                        theme,

                        logo,
                        show_logo,

                        shop_description,

                        show_shop_name,
                        show_shop_contact,

                        print_copies,

                        decimal_places,

                        amount_format,

                        table_style

                    )
                    VALUES
                    (
                        ?, ?, ?, ?, ?,

                        ?, ?,

                        ?, ?, ?,

                        ?,

                        ?, ?,

                        ?,

                        ?, ?,

                        ?,

                        ?,

                        ?,

                        ?
                    )
                    `,
                    [

                        shop_name || null,
                        phone || null,
                        address || null,
                        currency || 'AFN',
                        invoice_footer || null,

                        font_family || 'Tahoma',
                        font_size || '16px',

                        primary_color || '#2563eb',
                        secondary_color || '#1e293b',
                        button_color || '#2563eb',

                        finalTheme,

                        logo || null,
                        finalShowLogo,

                        shop_description || null,

                        finalShowShopName,
                        finalShowShopContact,

                        finalPrintCopies,

                        finalDecimalPlaces,

                        finalAmountFormat,

                        finalTableStyle

                    ]
                );


            return res.json({

                success: true,

                message:
                    'تنظیمات با موفقیت ذخیره شد',

                data: {

                    id:
                        result.insertId

                }

            });

        }


        /* =========================
           به‌روزرسانی تنظیمات
        ========================= */

        const settingsId =
            existingRows[0].id;


        await pool.query(
            `
            UPDATE settings
            SET

                shop_name = ?,
                phone = ?,
                address = ?,
                currency = ?,
                invoice_footer = ?,

                font_family = ?,
                font_size = ?,

                primary_color = ?,
                secondary_color = ?,
                button_color = ?,

                theme = ?,

                logo = ?,
                show_logo = ?,

                shop_description = ?,

                show_shop_name = ?,
                show_shop_contact = ?,

                print_copies = ?,

                decimal_places = ?,

                amount_format = ?,

                table_style = ?

            WHERE id = ?
            `,
            [

                shop_name || null,
                phone || null,
                address || null,
                currency || 'AFN',
                invoice_footer || null,

                font_family || 'Tahoma',
                font_size || '16px',

                primary_color || '#2563eb',
                secondary_color || '#1e293b',
                button_color || '#2563eb',

                finalTheme,

                logo || null,
                finalShowLogo,

                shop_description || null,

                finalShowShopName,
                finalShowShopContact,

                finalPrintCopies,

                finalDecimalPlaces,

                finalAmountFormat,

                finalTableStyle,

                settingsId

            ]
        );


        res.json({

            success: true,

            message:
                'تنظیمات با موفقیت ذخیره شد'

        });


    } catch (error) {

        console.error(
            'Save settings error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'ذخیره تنظیمات انجام نشد',

            error:
                error.message

        });

    }

});


module.exports = router;