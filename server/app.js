const express = require('express');
const cors = require('cors');
const session = require('express-session');

const pool = require('./config/database');

const categoryRoutes =
    require('./routes/categoryRoutes');

const productRoutes =
    require('./routes/productRoutes');

const customerRoutes =
    require('./routes/customerRoutes');

const saleRoutes =
    require('./routes/saleRoutes');

const purchaseRoutes =
    require('./routes/purchaseRoutes');

const supplierRoutes =
    require('./routes/supplierRoutes');

const customerPaymentRoutes =
    require('./routes/customerPaymentRoutes');

const cashRoutes =
    require('./routes/cashRoutes');

const supplierPaymentRoutes =
    require('./routes/supplierPaymentRoutes');

const expenseRoutes =
    require('./routes/expenseRoutes');

const withdrawalRoutes =
    require('./routes/withdrawalRoutes');

const reportRoutes =
    require('./routes/reportRoutes');

const reportDetailsRoutes =
    require('./routes/reportDetailsRoutes');

const purchaseReturnRoutes =
    require('./routes/purchaseReturnRoutes');

const saleReturnRoutes =
    require('./routes/saleReturnRoutes');

const productProfitRoutes =
    require('./routes/productProfitRoutes');

const inventoryReportRoutes =
    require('./routes/inventoryReportRoutes');

const stockMovementRoutes =
    require('./routes/stockMovementRoutes');

const backupRoutes =
    require('./routes/backupRoutes');

const settingsRoutes =
    require('./routes/settingsRoutes');

const userRoutes =
    require('./routes/userRoutes');

const authRoutes =
    require('./routes/authRoutes');

    const batchRoutes =
    require('./routes/batchRoutes');

    const {
    requireAuth,
    requireRole,
    requireAdmin
} = require('./middleware/authMiddleware');
const employeeRoutes =
    require('./routes/employeeRoutes');


const app =
    express();


/* =====================================================
   Middleware
===================================================== */

app.use(cors());

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);


/* =====================================================
   Session
===================================================== */

app.use(
    session({
        secret:
            'electrical-shop-secret-2026',

        resave:
            false,

        saveUninitialized:
            false,

        cookie: {

            httpOnly:
                true,

            sameSite:
                'lax',

            secure:
                false,

            maxAge:
                8 * 60 * 60 * 1000

        }

    })
);


/* =====================================================
   فایل‌های عمومی
===================================================== */

app.use(
    express.static('public')
);


/* =====================================================
   API Routes
===================================================== */

app.use(
    '/api/categories',
    requireAuth,
    categoryRoutes
);

app.use(
    '/api/products',
    requireAuth,
    productRoutes
);

app.use(
    '/api/customers',
    requireAuth,
    customerRoutes
);
app.use(
    '/api/sales',
    requireAuth,
    saleRoutes
);

app.use(
    '/api/purchases',
    requireRole(
        'admin',
        'accountant'
    ),
    purchaseRoutes
);
app.use(
    '/api/suppliers',
    requireRole(
        'admin',
        'accountant'
    ),
    supplierRoutes
);
app.use(
    '/api/customer-payments',
    requireAuth,
    customerPaymentRoutes
);

app.use(
    '/api/cash-transactions',
    requireRole(
        'admin',
        'accountant'
    ),
    cashRoutes
);
app.use(
    '/api/supplier-payments',
    requireRole(
        'admin',
        'accountant'
    ),
    supplierPaymentRoutes
);

app.use(
    '/api/expenses',
    requireRole(
        'admin',
        'accountant'
    ),
    expenseRoutes
);
app.use(
    '/api/withdrawals',
    requireRole(
        'admin',
        'accountant'
    ),
    withdrawalRoutes
);

app.use(
    '/api/batches',
    batchRoutes
);

app.use(
    '/api/employees',
    employeeRoutes
);

/* =====================================================
   گزارش‌ها
===================================================== */

app.use(
    '/api/reports',
    requireRole(
        'admin',
        'accountant'
    ),
    reportRoutes
);

app.use(
    '/api/report-details',
    requireRole(
        'admin',
        'accountant'
    ),
    reportDetailsRoutes
);

app.use(
    '/api/product-profit',
    requireRole(
        'admin',
        'accountant'
    ),
    productProfitRoutes
);

app.use(
    '/api/inventory-report',
    requireRole(
        'admin',
        'accountant'
    ),
    inventoryReportRoutes
);

app.use(
    '/api/stock-movements',
    requireRole(
        'admin',
        'accountant'
    ),
    stockMovementRoutes
);


/* =====================================================
   برگشت‌ها
===================================================== */

app.use(
    '/api/purchase-returns',
    requireRole(
        'admin',
        'accountant'
    ),
    purchaseReturnRoutes
);
app.use(
    '/api/sale-returns',
    requireRole(
        'admin',
        'seller',
        'accountant'
    ),
    saleReturnRoutes
);

/* =====================================================
   تنظیمات و امنیت
===================================================== */

app.use(
    '/api/settings',
    requireAdmin,
    settingsRoutes
);

app.use(
    '/api/users',
    requireAdmin,
    userRoutes
);

app.use(
    '/api/auth',
    authRoutes
);


/* =====================================================
   بکاپ
===================================================== */
app.use(
    '/api/backup',
    requireAdmin,
    backupRoutes
);


/* =====================================================
   بررسی اتصال دیتابیس
===================================================== */

app.get(
    '/api/health',
    async (req, res) => {

        try {

            await pool.query(
                'SELECT 1'
            );

            res.json({

                success:
                    true,

                message:
                    'Server and database are working'

            });

        } catch (error) {

            console.error(
                'Health check error:',
                error
            );

            res.status(500).json({

                success:
                    false,

                message:
                    'Database connection failed',

                error:
                    error.message

            });

        }

    }
);


/* =====================================================
   پورت
===================================================== */

const PORT =
    3012;


app.listen(
    PORT,
    () => {

        console.log(
            `Server running at http://localhost:${PORT}`
        );

    }
);