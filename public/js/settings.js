/* =====================================================
   تنظیمات سیستم
===================================================== */


/* =========================
   عناصر صفحه
========================= */

const settingsTabs =
    document.querySelectorAll(
        '.settings-tab'
    );


const settingsPanels =
    document.querySelectorAll(
        '.settings-panel'
    );


/* =========================
   اطلاعات فروشگاه
========================= */

const shopName =
    document.getElementById('shopName');

const phone =
    document.getElementById('phone');

const address =
    document.getElementById('address');

const shopDescription =
    document.getElementById('shopDescription');

const logo =
    document.getElementById('logo');

const showShopName =
    document.getElementById('showShopName');

const showShopContact =
    document.getElementById('showShopContact');

const showLogo =
    document.getElementById('showLogo');


/* =========================
   ظاهر
========================= */

const fontFamily =
    document.getElementById('fontFamily');

const fontSize =
    document.getElementById('fontSize');

const primaryColor =
    document.getElementById('primaryColor');

const secondaryColor =
    document.getElementById('secondaryColor');

const buttonColor =
    document.getElementById('buttonColor');

const theme =
    document.getElementById('theme');

const tableStyle =
    document.getElementById('tableStyle');


/* =========================
   فاکتور
========================= */

const invoiceFooter =
    document.getElementById('invoiceFooter');

const printCopies =
    document.getElementById('printCopies');

const invoiceShowShopName =
    document.getElementById(
        'invoiceShowShopName'
    );

const invoiceShowShopContact =
    document.getElementById(
        'invoiceShowShopContact'
    );

const invoiceShowLogo =
    document.getElementById(
        'invoiceShowLogo'
    );


/* =========================
   مالی
========================= */

const currency =
    document.getElementById('currency');

const decimalPlaces =
    document.getElementById(
        'decimalPlaces'
    );

const amountFormat =
    document.getElementById(
        'amountFormat'
    );


/* =========================
   دکمه‌ها
========================= */

const saveAppearanceBtn =
    document.getElementById(
        'saveAppearanceBtn'
    );

const saveShopBtn =
    document.getElementById(
        'saveShopBtn'
    );

const saveInvoiceBtn =
    document.getElementById(
        'saveInvoiceBtn'
    );

const saveFinancialBtn =
    document.getElementById(
        'saveFinancialBtn'
    );


const backupBtn =
    document.getElementById(
        'backupBtn'
    );

const restoreBtn =
    document.getElementById(
        'restoreBtn'
    );

const backupFile =
    document.getElementById(
        'backupFile'
    );

const backupMessage =
    document.getElementById(
        'backupMessage'
    );


const settingsMessage =
    document.getElementById(
        'settingsMessage'
    );


const systemTitle =
    document.getElementById(
        'systemTitle'
    );


/* =====================================================
   تنظیم تب‌ها
===================================================== */

settingsTabs.forEach(
    tab => {

        tab.addEventListener(
            'click',
            function () {

                const targetId =
                    this.dataset.tab;


                settingsTabs.forEach(
                    item => {

                        item.classList.remove(
                            'active'
                        );

                    }
                );


                settingsPanels.forEach(
                    panel => {

                        panel.style.display =
                            'none';

                    }
                );


                this.classList.add(
                    'active'
                );


                const target =
                    document.getElementById(
                        targetId
                    );


                if (target) {

                    target.style.display =
                        'block';

                }

            }
        );

    }
);


/* =====================================================
   دریافت تنظیمات
===================================================== */

async function loadSettings() {

    try {

        settingsMessage.textContent =
            'در حال دریافت تنظیمات...';


        const response =
            await fetch(
                '/api/settings'
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                'دریافت تنظیمات انجام نشد'
            );

        }


        const data =
            result.data || {};


        /* =========================
           اطلاعات فروشگاه
        ========================= */

        shopName.value =
            data.shop_name || '';

        phone.value =
            data.phone || '';

        address.value =
            data.address || '';

        shopDescription.value =
            data.shop_description || '';

        logo.value =
            data.logo || '';

        showShopName.checked =
            Number(
                data.show_shop_name
            ) === 1;

        showShopContact.checked =
            Number(
                data.show_shop_contact
            ) === 1;

        showLogo.checked =
            Number(
                data.show_logo
            ) === 1;


        /* =========================
           ظاهر
        ========================= */

        fontFamily.value =
            data.font_family ||
            'Tahoma';

        fontSize.value =
            data.font_size ||
            '16px';

        primaryColor.value =
            data.primary_color ||
            '#2563eb';

        secondaryColor.value =
            data.secondary_color ||
            '#1e293b';

        buttonColor.value =
            data.button_color ||
            '#2563eb';

        theme.value =
            data.theme ||
            'light';

        tableStyle.value =
            data.table_style ||
            'normal';


        /* =========================
           فاکتور
        ========================= */

        invoiceFooter.value =
            data.invoice_footer || '';

        printCopies.value =
            data.print_copies || 1;

        invoiceShowShopName.checked =
            Number(
                data.show_shop_name
            ) === 1;

        invoiceShowShopContact.checked =
            Number(
                data.show_shop_contact
            ) === 1;

        invoiceShowLogo.checked =
            Number(
                data.show_logo
            ) === 1;


        /* =========================
           مالی
        ========================= */

        currency.value =
            data.currency ||
            'AFN';

        decimalPlaces.value =
            String(
                data.decimal_places ?? 0
            );

        amountFormat.value =
            data.amount_format ||
            'comma';


        /* =========================
           اعمال ظاهر
        ========================= */

        applyAppearance(
            data
        );


        /* =========================
           عنوان سیستم
        ========================= */

        if (
            systemTitle &&
            data.shop_name
        ) {

            systemTitle.textContent =
                data.shop_name;

        }


        settingsMessage.textContent =
            'تنظیمات با موفقیت دریافت شد';


    } catch (error) {

        console.error(error);


        settingsMessage.textContent =
            error.message ||
            'خطا در دریافت تنظیمات';

    }

}


/* =====================================================
   اعمال ظاهر
===================================================== */

function applyAppearance(
    data
) {

    const root =
        document.documentElement;


    root.style.setProperty(
        '--primary-color',
        data.primary_color ||
        '#2563eb'
    );


    root.style.setProperty(
        '--secondary-color',
        data.secondary_color ||
        '#1e293b'
    );


    root.style.setProperty(
        '--button-color',
        data.button_color ||
        '#2563eb'
    );


    document.body.style.fontFamily =
    data.font_family ||
    'Tahoma';


document.body.style.fontSize =
    data.font_size ||
    '16px';


    if (
        data.theme === 'dark'
    ) {

        document.body.classList.add(
            'dark-theme'
        );

    } else {

        document.body.classList.remove(
            'dark-theme'
        );

    }


    document.body.dataset.tableStyle =
        data.table_style ||
        'normal';

}


/* =====================================================
   گرفتن تنظیمات فعلی فرم
===================================================== */

function getSettingsData() {

    return {

        shop_name:
            shopName.value.trim(),

        phone:
            phone.value.trim(),

        address:
            address.value.trim(),

        currency:
            currency.value,

        invoice_footer:
            invoiceFooter.value.trim(),

        font_family:
            fontFamily.value,

        font_size:
            fontSize.value,

        primary_color:
            primaryColor.value,

        secondary_color:
            secondaryColor.value,

        button_color:
            buttonColor.value,

        theme:
            theme.value,

        logo:
            logo.value.trim() ||
            null,

        show_logo:
            showLogo.checked ? 1 : 0,

        shop_description:
            shopDescription.value.trim(),

        show_shop_name:
            showShopName.checked ? 1 : 0,

        show_shop_contact:
            showShopContact.checked ? 1 : 0,

        print_copies:
            Number(
                printCopies.value
            ) || 1,

        decimal_places:
            Number(
                decimalPlaces.value
            ) || 0,

        amount_format:
            amountFormat.value,

        table_style:
            tableStyle.value

    };

}


/* =====================================================
   ذخیره تنظیمات
===================================================== */

async function saveSettings(
    successMessage
) {

    try {

        settingsMessage.textContent =
            'در حال ذخیره تنظیمات...';


        const data =
            getSettingsData();


        const response =
            await fetch(
                '/api/settings',
                {

                    method:
                        'PUT',

                    headers: {

                        'Content-Type':
                            'application/json'

                    },

                    body:
                        JSON.stringify(
                            data
                        )

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
                'ذخیره تنظیمات انجام نشد'
            );

        }


        applyAppearance(
            data
        );


        if (systemTitle) {

            systemTitle.textContent =
                data.shop_name ||
                'سیستم مدیریت فروشگاه لوازم برق';

        }


        settingsMessage.textContent =
            successMessage ||
            'تنظیمات با موفقیت ذخیره شد';


    } catch (error) {

        console.error(error);


        settingsMessage.textContent =
            error.message ||
            'خطا در ذخیره تنظیمات';

    }

}


/* =====================================================
   ذخیره ظاهر
===================================================== */

saveAppearanceBtn.addEventListener(
    'click',
    function () {

        saveSettings(
            'تنظیمات ظاهر با موفقیت ذخیره شد'
        );

    }
);


/* =====================================================
   ذخیره اطلاعات فروشگاه
===================================================== */

saveShopBtn.addEventListener(
    'click',
    function () {

        saveSettings(
            'اطلاعات فروشگاه با موفقیت ذخیره شد'
        );

    }
);


/* =====================================================
   ذخیره فاکتور
===================================================== */

saveInvoiceBtn.addEventListener(
    'click',
    function () {

        saveSettings(
            'تنظیمات فاکتور با موفقیت ذخیره شد'
        );

    }
);


/* =====================================================
   ذخیره مالی
===================================================== */

saveFinancialBtn.addEventListener(
    'click',
    function () {

        saveSettings(
            'تنظیمات مالی با موفقیت ذخیره شد'
        );

    }
);


/* =====================================================
   پیش‌نمایش زنده فونت
===================================================== */

fontFamily.addEventListener(
    'change',
    function () {

        document.documentElement.style.setProperty(
            '--system-font',
            this.value
        );

    }
);

/* =====================================================
   پیش‌نمایش زنده اندازه فونت
===================================================== */

fontSize.addEventListener(
    'change',
    function () {

        document.documentElement.style.setProperty(
            '--system-font-size',
            this.value
        );

    }
);


/* =====================================================
   پیش‌نمایش زنده رنگ‌ها
===================================================== */

primaryColor.addEventListener(
    'input',
    function () {

        document.documentElement.style
            .setProperty(
                '--primary-color',
                this.value
            );

    }
);


secondaryColor.addEventListener(
    'input',
    function () {

        document.documentElement.style
            .setProperty(
                '--secondary-color',
                this.value
            );

    }
);


buttonColor.addEventListener(
    'input',
    function () {

        document.documentElement.style
            .setProperty(
                '--button-color',
                this.value
            );

    }
);


/* =====================================================
   پیش‌نمایش تم
===================================================== */

theme.addEventListener(
    'change',
    function () {

        if (
            this.value === 'dark'
        ) {

            document.body.classList.add(
                'dark-theme'
            );

        } else {

            document.body.classList.remove(
                'dark-theme'
            );

        }

    }
);


/* =====================================================
   ایجاد بکاپ
===================================================== */

backupBtn.addEventListener(
    'click',
    async function () {

        try {

            backupBtn.disabled =
                true;


            backupMessage.textContent =
                'در حال ایجاد بکاپ...';


            const response =
                await fetch(
                    '/api/backup/backup'
                );


            if (!response.ok) {

                let errorMessage =
                    'ایجاد بکاپ انجام نشد';


                try {

                    const result =
                        await response.json();


                    errorMessage =
                        result.message ||
                        errorMessage;

                } catch (error) {

                    /* پاسخ JSON نبود */

                }


                throw new Error(
                    errorMessage
                );

            }


            const blob =
                await response.blob();


            if (!blob.size) {

                throw new Error(
                    'فایل بکاپ خالی است'
                );

            }


            let fileName =
                'electrical_shop_backup.sql';


            const disposition =
                response.headers.get(
                    'Content-Disposition'
                );


            if (disposition) {

                const match =
                    disposition.match(
                        /filename="?([^"]+)"?/i
                    );


                if (
                    match &&
                    match[1]
                ) {

                    fileName =
                        match[1];

                }

            }


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    'a'
                );


            link.href =
                url;

            link.download =
                fileName;


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            URL.revokeObjectURL(
                url
            );


            backupMessage.textContent =
                'بکاپ با موفقیت ایجاد و دانلود شد';


        } catch (error) {

            console.error(error);


            backupMessage.textContent =
                error.message ||
                'خطا در ایجاد بکاپ';

        } finally {

            backupBtn.disabled =
                false;

        }

    }
);


/* =====================================================
   انتخاب فایل بازیابی
===================================================== */

restoreBtn.addEventListener(
    'click',
    function () {

        backupFile.click();

    }
);


/* =====================================================
   بازیابی بکاپ
===================================================== */

backupFile.addEventListener(
    'change',
    async function () {

        const file =
            this.files[0];


        if (!file) {

            return;

        }


        if (
            !file.name
                .toLowerCase()
                .endsWith('.sql')
        ) {

            alert(
                'لطفاً فقط فایل SQL انتخاب کنید'
            );


            this.value =
                '';


            return;

        }


        const confirmed =
            confirm(
                'هشدار!\n\n' +
                'بازیابی بکاپ می‌تواند اطلاعات فعلی دیتابیس را تغییر یا جایگزین کند.\n\n' +
                'آیا مطمئن هستید؟'
            );


        if (!confirmed) {

            this.value =
                '';


            return;

        }


        try {

            restoreBtn.disabled =
                true;

            backupBtn.disabled =
                true;


            backupMessage.textContent =
                'در حال بازیابی بکاپ...';


            const formData =
                new FormData();


            formData.append(
                'backup',
                file
            );


            const response =
                await fetch(
                    '/api/backup/restore',
                    {

                        method:
                            'POST',

                        body:
                            formData

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
                    'بازیابی بکاپ انجام نشد'
                );

            }


            alert(
                'بکاپ با موفقیت بازیابی شد'
            );


            backupMessage.textContent =
                'بکاپ با موفقیت بازیابی شد';


        } catch (error) {

            console.error(error);


            backupMessage.textContent =
                error.message ||
                'خطا در بازیابی بکاپ';

        } finally {

            restoreBtn.disabled =
                false;

            backupBtn.disabled =
                false;

            this.value =
                '';

        }

    }
);


/* =====================================================
   شروع
===================================================== */

loadSettings();