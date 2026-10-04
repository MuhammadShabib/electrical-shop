const express = require('express');

const router = express.Router();

const pool =
    require('../config/database');


/* =====================================================
   دریافت همه کارمندان
===================================================== */

router.get('/', async (req, res) => {

    try {

        const [rows] =
            await pool.query(`
                SELECT
                    id,
                    first_name,
                    last_name,
                    phone,
                    address,
                    salary,
                    work_time,
                    status,
                    created_at
                FROM employees
                ORDER BY id DESC
            `);


        res.json({
            success: true,
            data: rows
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                'خطا در دریافت کارمندان'

        });

    }

});


/* =====================================================
   خلاصه حساب کارمند
===================================================== */

router.get('/:id/account', async (req, res) => {

    try {

        const { id } =
            req.params;


        const [employees] =
            await pool.query(
                `
                SELECT
                    id,
                    first_name,
                    last_name,
                    phone,
                    address,
                    salary,
                    work_time,
                    status
                FROM employees
                WHERE id = ?
                `,
                [id]
            );


        if (employees.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    'کارمند پیدا نشد'

            });

        }


        const employee =
            employees[0];


        const [summaryRows] =
            await pool.query(
                `
                SELECT

                    COALESCE(
                        SUM(
                            CASE
                                WHEN type = 'debit'
                                THEN amount
                                ELSE 0
                            END
                        ),
                        0
                    ) AS total_debit,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN type = 'credit'
                                THEN amount
                                ELSE 0
                            END
                        ),
                        0
                    ) AS total_credit

                FROM employee_transactions

                WHERE employee_id = ?
                `,
                [id]
            );


        const totalDebit =
            Number(
                summaryRows[0].total_debit
            ) || 0;


        const totalCredit =
            Number(
                summaryRows[0].total_credit
            ) || 0;


        const balance =
            totalCredit -
            totalDebit;


        let balanceType =
            'settled';


        if (balance > 0) {

            balanceType =
                'credit';

        }

        else if (balance < 0) {

            balanceType =
                'debit';

        }


        res.json({

            success: true,

            data: {

                employee,

                total_debit:
                    totalDebit,

                total_credit:
                    totalCredit,

                balance,

                balance_type:
                    balanceType

            }

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                'خطا در دریافت حساب کارمند'

        });

    }

});



/* =====================================================
   گردش حساب کارمند
===================================================== */

router.get(
    '/:id/transactions',
    async (req, res) => {

        try {

            const { id } =
                req.params;


            const [rows] =
                await pool.query(
                    `
                    SELECT

                        id,
                        type,
                        amount,
                        description,
                        reference_type,
                        reference_id,
                        salary_month,
                        transaction_date,
                        created_at

                    FROM employee_transactions

                    WHERE employee_id = ?

                    ORDER BY id ASC
                    `,
                    [id]
                );


            res.json({

                success: true,

                data: rows

            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    'خطا در دریافت گردش حساب کارمند'

            });

        }

    }
);



/* =====================================================
   ثبت تراکنش کارمند
===================================================== */

router.post(
    '/:id/transactions',
    async (req, res) => {

        const connection =
            await pool.getConnection();


        try {

            const { id } =
                req.params;

const {
    kind,
    amount,
    description,
    salary_month
} = req.body;

            const transactionAmount =
                Number(amount) || 0;


            if (
                transactionAmount <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'مبلغ باید بیشتر از صفر باشد'

                });

            }

            if (kind === 'salary' && !salary_month) {

    return res.status(400).json({
        success: false,
        message: 'لطفاً ماه معاش را مشخص کنید'
    });

}

if (kind === 'salary') {

    const [existingSalary] =
        await pool.query(
            `
            SELECT id
            FROM employee_transactions
            WHERE employee_id = ?
              AND salary_month = ?
            LIMIT 1
            `,
            [
                id,
                salary_month
            ]
        );

    if (existingSalary.length > 0) {

        return res.status(400).json({
            success: false,
            message:
                'معاش این کارمند برای این ماه قبلاً محاسبه شده است'
        });

    }

}


            const allowedKinds = [
                'salary',
                'withdrawal',
                'salary_payment'
            ];


            if (
                !allowedKinds.includes(
                    kind
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'نوع تراکنش نامعتبر است'

                });

            }


            await connection.beginTransaction();


            /* =========================
               بررسی کارمند
            ========================== */

            const [employees] =
                await connection.query(
                    `
                    SELECT
                        id,
                        first_name,
                        last_name,
                        status
                    FROM employees

                    WHERE id = ?

                    FOR UPDATE
                    `,
                    [id]
                );


            if (
                employees.length === 0
            ) {

                throw new Error(
                    'کارمند پیدا نشد'
                );

            }


            const employee =
                employees[0];


            if (
                Number(
                    employee.status
                ) !== 1
            ) {

                throw new Error(
                    'این کارمند غیرفعال است'
                );

            }


            /* =========================
               تعیین دبت / کریدیت
            ========================== */

            let type;


            if (kind === 'salary') {

                type =
                    'credit';

            }

            else {

                type =
                    'debit';

            }

/* =========================
   ثبت حساب کارمند
========================== */

const [result] =
    await connection.query(
        `
        INSERT INTO
        employee_transactions
        (
            employee_id,
            type,
            amount,
            description,
            reference_type,
            salary_month
        )

        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [

            id,

            type,

            transactionAmount,

            description || null,

            kind,

            kind === 'salary'
                ? salary_month
                : null

        ]
    );


const transactionId =
    result.insertId;

            /* =========================
               کاهش صندوق
               برای برداشت و پرداخت معاش
            ========================== */

            if (
                kind === 'withdrawal' ||
                kind === 'salary_payment'
            ) {

                const cashDescription =

                    kind === 'withdrawal'

                    ?

                    `برداشت کارمند:
                     ${employee.first_name}
                     ${employee.last_name}`

                    :

                    `پرداخت معاش:
                     ${employee.first_name}
                     ${employee.last_name}`;


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
                        'withdrawal',
                        ?,
                        ?,
                        ?,
                        NOW()
                    )
                    `,
                    [

                        transactionAmount,

                        transactionId,

                        cashDescription

                    ]
                );

            }


            await connection.commit();


            res.status(201).json({

                success: true,

                message:
                    'تراکنش کارمند با موفقیت ثبت شد',

                id:
                    transactionId

            });


        } catch (error) {

            await connection.rollback();

            console.error(error);

            res.status(400).json({

                success: false,

                message:
                    error.message ||
                    'خطا در ثبت تراکنش کارمند'

            });

        }

        finally {

            connection.release();

        }

    }
);

/* =====================================================
   دریافت یک کارمند
===================================================== */

router.get('/:id', async (req, res) => {

    try {

        const { id } =
            req.params;


        const [rows] =
            await pool.query(
                `
                SELECT *
                FROM employees
                WHERE id = ?
                `,
                [id]
            );


        if (rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    'کارمند پیدا نشد'

            });

        }


        res.json({

            success: true,

            data: rows[0]

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                'خطا در دریافت اطلاعات کارمند'

        });

    }

});


/* =====================================================
   ثبت کارمند جدید
===================================================== */

router.post('/', async (req, res) => {

    try {

        const {

            first_name,
            last_name,
            phone,
            address,
            salary,
            work_time

        } = req.body;


        if (
            !first_name ||
            first_name.trim() === ''
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'نام کارمند الزامی است'

            });

        }


        if (
            !last_name ||
            last_name.trim() === ''
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'تخلص کارمند الزامی است'

            });

        }


        const salaryAmount =
            Number(salary) || 0;


        if (salaryAmount < 0) {

            return res.status(400).json({

                success: false,

                message:
                    'معاش نمی‌تواند منفی باشد'

            });

        }


        const [result] =
            await pool.query(
                `
                INSERT INTO employees
                (
                    first_name,
                    last_name,
                    phone,
                    address,
                    salary,
                    work_time
                )
                VALUES (?, ?, ?, ?, ?, ?)
                `,
                [

                    first_name.trim(),

                    last_name.trim(),

                    phone || null,

                    address || null,

                    salaryAmount,

                    work_time || null

                ]
            );


        res.status(201).json({

            success: true,

            message:
                'کارمند با موفقیت ثبت شد',

            id:
                result.insertId

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                'خطا در ثبت کارمند'

        });

    }

});


/* =====================================================
   ویرایش کارمند
===================================================== */

router.put('/:id', async (req, res) => {

    try {

        const { id } =
            req.params;


        const {

            first_name,
            last_name,
            phone,
            address,
            salary,
            work_time

        } = req.body;


        if (
            !first_name ||
            first_name.trim() === ''
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'نام کارمند الزامی است'

            });

        }


        if (
            !last_name ||
            last_name.trim() === ''
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'تخلص کارمند الزامی است'

            });

        }


        const salaryAmount =
            Number(salary) || 0;


        if (salaryAmount < 0) {

            return res.status(400).json({

                success: false,

                message:
                    'معاش نمی‌تواند منفی باشد'

            });

        }


        const [result] =
            await pool.query(
                `
                UPDATE employees
                SET
                    first_name = ?,
                    last_name = ?,
                    phone = ?,
                    address = ?,
                    salary = ?,
                    work_time = ?
                WHERE id = ?
                `,
                [

                    first_name.trim(),

                    last_name.trim(),

                    phone || null,

                    address || null,

                    salaryAmount,

                    work_time || null,

                    id

                ]
            );


        if (result.affectedRows === 0) {

            return res.status(404).json({

                success: false,

                message:
                    'کارمند پیدا نشد'

            });

        }


        res.json({

            success: true,

            message:
                'اطلاعات کارمند با موفقیت ویرایش شد'

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                'خطا در ویرایش کارمند'

        });

    }

});


/* =====================================================
   غیرفعال کردن کارمند
===================================================== */

router.delete('/:id', async (req, res) => {

    try {

        const { id } =
            req.params;


        const [result] =
            await pool.query(
                `
                UPDATE employees
                SET status = 0
                WHERE id = ?
                `,
                [id]
            );


        if (result.affectedRows === 0) {

            return res.status(404).json({

                success: false,

                message:
                    'کارمند پیدا نشد'

            });

        }


        res.json({

            success: true,

            message:
                'کارمند غیرفعال شد'

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                'خطا در غیرفعال کردن کارمند'

        });

    }

});


/* =====================================================
   فعال کردن کارمند
===================================================== */

router.put('/:id/enable', async (req, res) => {

    try {

        const { id } =
            req.params;


        const [result] =
            await pool.query(
                `
                UPDATE employees
                SET status = 1
                WHERE id = ?
                `,
                [id]
            );


        if (result.affectedRows === 0) {

            return res.status(404).json({

                success: false,

                message:
                    'کارمند پیدا نشد'

            });

        }


        res.json({

            success: true,

            message:
                'کارمند فعال شد'

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                'خطا در فعال کردن کارمند'

        });

    }

});


module.exports = router;