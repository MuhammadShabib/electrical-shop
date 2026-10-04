/* =====================================================
   تنظیمات سراسری سیستم
===================================================== */

(async function () {

    try {

        const response =
            await fetch('/api/settings');


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            return;

        }


        const settings =
            result.data || {};


        /* =========================
           ذخیره تنظیمات سراسری
        ========================= */

        window.systemSettings =
            settings;


        /* =========================
           متغیرهای CSS
        ========================= */

        const root =
            document.documentElement;


        root.style.setProperty(
            '--system-font',
            settings.font_family ||
            'Tahoma'
        );


        root.style.setProperty(
            '--system-font-size',
            settings.font_size ||
            '16px'
        );


        root.style.setProperty(
            '--primary-color',
            settings.primary_color ||
            '#2563eb'
        );


        root.style.setProperty(
            '--secondary-color',
            settings.secondary_color ||
            '#1e293b'
        );


        root.style.setProperty(
            '--button-color',
            settings.button_color ||
            '#2563eb'
        );


        /* =========================
           فونت
        ========================= */

        document.body.style.fontFamily =
            `var(--system-font), Arial, sans-serif`;


        document.body.style.fontSize =
            'var(--system-font-size)';


        /* =========================
           تم
        ========================= */

        if (
            settings.theme === 'dark'
        ) {

            document.body.classList.add(
                'dark-theme'
            );

        } else {

            document.body.classList.remove(
                'dark-theme'
            );

        }


        /* =========================
           ظاهر جدول
        ========================= */

        document.body.dataset.tableStyle =
            settings.table_style ||
            'normal';


        /* =========================
           عنوان سیستم
        ========================= */

        const systemTitles =
            document.querySelectorAll(
                '#systemTitle'
            );


        systemTitles.forEach(
            element => {

                if (
                    settings.shop_name &&
                    Number(
                        settings.show_shop_name
                    ) === 1
                ) {

                    element.textContent =
                        settings.shop_name;

                }

            }
        );


        /* =========================
           واحد پول در HTML
        ========================= */

        const currencyElements =
            document.querySelectorAll(
                '.currency-label'
            );


        currencyElements.forEach(
            element => {

                element.textContent =
                    settings.currency ||
                    'AFN';

            }
        );


        /* =========================
           تابع فرمت مبلغ
        ========================= */

        window.formatSystemMoney =
            function (value) {

                const number =
                    Number(value || 0);


                const decimals =
                    Math.max(
                        0,
                        Math.min(
                            4,
                            Number(
                                settings.decimal_places
                            ) || 0
                        )
                    );


                if (
                    settings.amount_format ===
                    'plain'
                ) {

                    return number.toFixed(
                        decimals
                    );

                }


                return number.toLocaleString(
                    'en-US',
                    {
                        minimumFractionDigits:
                            decimals,

                        maximumFractionDigits:
                            decimals
                    }
                );

            };


        /* =========================
           واحد پول متنی
        ========================= */

        window.getSystemCurrency =
            function () {

                return (
                    settings.currency ||
                    'AFN'
                );

            };


    } catch (error) {

        console.error(
            'System settings error:',
            error
        );

    }

/* =========================
   مبلغ + واحد پول
========================= */

window.formatSystemMoneyWithCurrency =
    function (value) {

        const amount =
            window.formatSystemMoney
                ? window.formatSystemMoney(value)
                : Number(value || 0).toLocaleString('en-US');

        const currency =
            window.getSystemCurrency
                ? window.getSystemCurrency()
                : 'AFN';

        return `${amount} ${currency}`;

    };

})();