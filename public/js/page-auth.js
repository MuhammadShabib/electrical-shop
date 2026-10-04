/* =====================================================
   احراز هویت و کنترل دسترسی صفحات
===================================================== */

(async function () {

    /*
     * تنظیمات دسترسی هر صفحه
     *
     * اگر برای صفحه‌ای roles تعریف نشود،
     * فقط ورود کاربر بررسی می‌شود.
     */

    const pageAccess = {

        'index.html': [
            'admin',
            'seller',
            'accountant'
        ],

        'sales.html': [
            'admin',
            'seller',
            'accountant'
        ],

        'sale-details.html': [
            'admin',
            'seller',
            'accountant'
        ],

        'sale-return.html': [
            'admin',
            'seller',
            'accountant'
        ],

        'customers.html': [
            'admin',
            'seller',
            'accountant'
        ],

        'customer-details.html': [
            'admin',
            'seller',
            'accountant'
        ],

        'customer-account.html': [
            'admin',
            'seller',
            'accountant'
        ],

        'customer-payment.html': [
            'admin',
            'seller',
            'accountant'
        ],

        'purchases.html': [
            'admin',
            'accountant'
        ],

        'purchase-details.html': [
            'admin',
            'accountant'
        ],

        'purchase-return.html': [
            'admin',
            'accountant'
        ],

        'suppliers.html': [
            'admin',
            'accountant'
        ],

        'supplier-account.html': [
            'admin',
            'accountant'
        ],

        'supplier-payment.html': [
            'admin',
            'accountant'
        ],

        'cash.html': [
            'admin',
            'accountant'
        ],

        'expenses.html': [
            'admin',
            'accountant'
        ],

        'withdrawals.html': [
            'admin',
            'accountant'
        ],

        'reports.html': [
            'admin',
            'accountant'
        ],

        'report-details.html': [
            'admin',
            'accountant'
        ],

        'product-profit.html': [
            'admin',
            'accountant'
        ],

        'inventory-report.html': [
            'admin',
            'accountant'
        ],

        'stock-movements.html': [
            'admin',
            'accountant'
        ],

        'products.html': [
            'admin',
            'accountant'
        ],

        'settings.html': [
            'admin'
        ]

    };


    /* =========================
       صفحه فعلی
    ========================= */

    const currentPage =
        window.location.pathname
            .split('/')
            .pop()
            .toLowerCase();


    const allowedRoles =
        pageAccess[currentPage];


    /* =========================
       بررسی Session
    ========================= */

    try {

        const response =
            await fetch(
                '/api/auth/me'
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success ||
            !result.data
        ) {

            window.location.replace(
                '/login.html'
            );

            return;

        }


        const user =
            result.data;


        /* =========================
           بررسی نقش
        ========================= */

        if (
            Array.isArray(
                allowedRoles
            ) &&
            !allowedRoles.includes(
                user.role
            )
        ) {

            alert(
                'شما اجازه دسترسی به این بخش را ندارید'
            );


            window.location.replace(
                '/'
            );

            return;

        }


        /* =========================
           اطلاعات کاربر در صفحه
        ========================= */

        window.currentUser =
            user;


        const userNameElements =
            document.querySelectorAll(
                '[data-user-name]'
            );


        userNameElements.forEach(
            element => {

                element.textContent =
                    user.name || user.username;

            }
        );


        const userRoleElements =
            document.querySelectorAll(
                '[data-user-role]'
            );


        userRoleElements.forEach(
            element => {

                element.textContent =
                    getRoleText(
                        user.role
                    );

            }
        );


        /* =========================
           خروج از سیستم
        ========================= */

        const logoutButtons =
            document.querySelectorAll(
                '[data-logout]'
            );


        logoutButtons.forEach(
            button => {

                button.addEventListener(
                    'click',
                    logout
                );

            }
        );


        /* =========================
           نمایش عناصر بر اساس نقش
        ========================= */

        document
            .querySelectorAll(
                '[data-role]'
            )
            .forEach(
                element => {

                    const roles =
                        element
                            .dataset
                            .role
                            .split(',')
                            .map(
                                role =>
                                    role.trim()
                            );


                    if (
                        !roles.includes(
                            user.role
                        )
                    ) {

                        element.style.display =
                            'none';

                    }

                }
            );


    } catch (error) {

        console.error(
            'Page authentication error:',
            error
        );


        window.location.replace(
            '/login.html'
        );

    }


    /* =========================
       نام نقش
    ========================= */

    function getRoleText(role) {

        const roles = {

            admin:
                'مدیر سیستم',

            seller:
                'شرکت',

            accountant:
                'حسابدار'

        };


        return (
            roles[role] ||
            role ||
            '-'
        );

    }


    /* =========================
       خروج
    ========================= */

    async function logout() {

        const confirmed =
            confirm(
                'آیا می‌خواهید از سیستم خارج شوید؟'
            );


        if (!confirmed) {

            return;

        }


        try {

            const response =
                await fetch(
                    '/api/auth/logout',
                    {
                        method:
                            'POST'
                    }
                );


            const result =
                await response.json();


            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    'خروج انجام نشد'
                );

            }


            window.location.replace(
                '/login.html'
            );


        } catch (error) {

            console.error(
                'Logout error:',
                error
            );


            alert(
                error.message ||
                'خروج از سیستم انجام نشد'
            );

        }

    }

})();