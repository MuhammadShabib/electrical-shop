/* =========================
   دریافت ID فاکتور
========================= */

const params =
    new URLSearchParams(
        window.location.search
    );

const saleId =
    params.get('id');


/* =========================
   عناصر صفحه
========================= */

const invoiceNumber =
    document.getElementById(
        'invoiceNumber'
    );

const printInvoiceNumber =
    document.getElementById(
        'printInvoiceNumber'
    );

const saleDate =
    document.getElementById(
        'saleDate'
    );

const customerName =
    document.getElementById(
        'customerName'
    );

const description =
    document.getElementById(
        'description'
    );

const saleItemsBody =
    document.getElementById(
        'saleItemsBody'
    );

const totalBeforeDiscount =
    document.getElementById(
        'totalBeforeDiscount'
    );

const discount =
    document.getElementById(
        'discount'
    );

const totalAmount =
    document.getElementById(
        'totalAmount'
    );

const paidAmount =
    document.getElementById(
        'paidAmount'
    );

const remainingAmount =
    document.getElementById(
        'remainingAmount'
    );


/* =========================
   عناصر تنظیمات فاکتور
========================= */

const invoiceShopName =
    document.getElementById(
        'invoiceShopName'
    );

const invoicePhone =
    document.getElementById(
        'invoicePhone'
    );

const invoiceAddress =
    document.getElementById(
        'invoiceAddress'
    );

const invoiceShopContact =
    document.getElementById(
        'invoiceShopContact'
    );

const invoiceLogo =
    document.getElementById(
        'invoiceLogo'
    );

const invoiceLogoContainer =
    document.getElementById(
        'invoiceLogoContainer'
    );

const currencyLabels =
    document.querySelectorAll(
        '.currency-label'
    );



/* =========================
   تنظیمات پیش‌فرض
========================= */

let systemSettings = {

    currency: 'AFN',

    decimal_places: 0,

    amount_format: 'comma',

    shop_name:
        'سیستم مدیریت فروشگاه',

    phone: '',

    address: '',

    invoice_footer: '',

    show_shop_name: 1,

    show_shop_contact: 1,

    show_logo: 0,

    logo: null

};



/* =========================
   فرمت مبلغ
========================= */

function formatMoney(value) {

    const decimals =
        Math.max(
            0,
            Math.min(
                4,
                Number(
                    systemSettings.decimal_places
                ) || 0
            )
        );


    let number =
        Number(value || 0);


    if (
        systemSettings.amount_format ===
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

}



/* =========================
   فرمت تاریخ
========================= */

function formatDate(value) {

    if (!value) {

        return '-';

    }

    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleString(
        'fa-IR',
        {

            year: 'numeric',

            month: '2-digit',

            day: '2-digit',

            hour: '2-digit',

            minute: '2-digit'

        }
    );

}



/* =========================
   دریافت تنظیمات سیستم
========================= */

async function loadInvoiceSettings() {

    try {

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

            return;

        }


        systemSettings = {

            ...systemSettings,

            ...(result.data || {})

        };


        applyInvoiceSettings();


    } catch (error) {

        console.error(
            'Invoice settings error:',
            error
        );

    }

}



/* =========================
   اعمال تنظیمات فاکتور
========================= */

function applyInvoiceSettings() {

    /* =========================
       نام فروشگاه
    ========================= */

    if (invoiceShopName) {

        if (
            Number(
                systemSettings.show_shop_name
            ) === 1 &&
            systemSettings.shop_name
        ) {

            invoiceShopName.textContent =
                systemSettings.shop_name;

            invoiceShopName.style.display =
                '';

        } else {

            invoiceShopName.style.display =
                'none';

        }

    }


    /* =========================
       تلفن و آدرس
    ========================= */

    if (invoiceShopContact) {

        if (
            Number(
                systemSettings.show_shop_contact
            ) === 1
        ) {

            invoiceShopContact.style.display =
                '';

            if (invoicePhone) {

                if (
                    systemSettings.phone
                ) {

                    invoicePhone.textContent =
                        `تلفن: ${systemSettings.phone}`;

                    invoicePhone.style.display =
                        '';

                } else {

                    invoicePhone.style.display =
                        'none';

                }

            }


            if (invoiceAddress) {

                if (
                    systemSettings.address
                ) {

                    invoiceAddress.textContent =
                        `آدرس: ${systemSettings.address}`;

                    invoiceAddress.style.display =
                        '';

                } else {

                    invoiceAddress.style.display =
                        'none';

                }

            }

        } else {

            invoiceShopContact.style.display =
                'none';

        }

    }


    /* =========================
       لوگو
    ========================= */

    if (
        invoiceLogo &&
        invoiceLogoContainer
    ) {

        if (
            Number(
                systemSettings.show_logo
            ) === 1 &&
            systemSettings.logo
        ) {

            invoiceLogo.src =
                systemSettings.logo;

            invoiceLogo.style.display =
                'block';

            invoiceLogoContainer.style.display =
                'block';

        } else {

            invoiceLogo.src =
                '';

            invoiceLogo.style.display =
                'none';

            invoiceLogoContainer.style.display =
                'none';

        }

    }


    /* =========================
       واحد پول
    ========================= */

    currencyLabels.forEach(
        label => {

            label.textContent =
                systemSettings.currency ||
                'AFN';

        }
    );

}



/* =========================
   متن پایین فاکتور
========================= */

function applyInvoiceFooter() {

    if (
        !systemSettings.invoice_footer
    ) {

        return;

    }


    let footer =
        document.getElementById(
            'invoiceFooter'
        );


    if (!footer) {

        footer =
            document.createElement(
                'div'
            );

        footer.id =
            'invoiceFooter';

        footer.className =
            'invoice-footer';


        document.querySelector(
            '.invoice-signatures'
        )?.insertAdjacentElement(
            'beforebegin',
            footer
        );

    }


    footer.textContent =
        systemSettings.invoice_footer;


    footer.style.textAlign =
        'center';

    footer.style.marginTop =
        '20px';

    footer.style.paddingTop =
        '10px';

    footer.style.borderTop =
        '1px solid #ddd';

}



/* =========================
   بررسی ID
========================= */

if (!saleId) {

    alert(
        'شناسه فاکتور مشخص نیست'
    );

    window.location.href =
        '/sales.html';

}


/* =========================
   دریافت فاکتور
========================= */

async function loadSale() {

    try {

        const response =
            await fetch(
                `/api/sales/${saleId}`
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            alert(
                result.message ||
                'فاکتور پیدا نشد'
            );

            window.location.href =
                '/sales.html';

            return;

        }


        const sale =
            result.data.sale;

        const items =
            result.data.items || [];


        /* =====================
           اطلاعات فاکتور
        ===================== */

        invoiceNumber.textContent =
            sale.invoice_number || '-';


        printInvoiceNumber.textContent =
            sale.invoice_number || '-';


        saleDate.textContent =
            formatDate(
                sale.sale_date
            );


        customerName.textContent =
            sale.customer_name ||
            'مشتری متفرقه';


        description.textContent =
            sale.description ||
            '-';


        /* =========================
           دکمه برگشت دوا
        ========================= */

        const returnSaleBtn =
            document.getElementById(
                'returnSaleBtn'
            );


        if (returnSaleBtn) {

            returnSaleBtn.addEventListener(
                'click',
                function () {

                    window.location.href =
                        `/sale-return.html?id=${saleId}`;

                }
            );

        }


        /* =====================
           مبالغ
        ===================== */

        const discountValue =
            Number(
                sale.discount
            ) || 0;


        const totalValue =
            Number(
                sale.total_amount
            ) || 0;


        const beforeDiscount =
            totalValue +
            discountValue;


        totalBeforeDiscount.textContent =
            formatMoney(
                beforeDiscount
            );


        discount.textContent =
            formatMoney(
                discountValue
            );


        totalAmount.textContent =
            formatMoney(
                totalValue
            );


        paidAmount.textContent =
            formatMoney(
                sale.paid_amount
            );


        remainingAmount.textContent =
            formatMoney(
                sale.remaining_amount
            );


        /* =====================
           اقلام فاکتور
        ===================== */

        saleItemsBody.innerHTML =
            '';


        if (items.length === 0) {

            saleItemsBody.innerHTML = `

                <tr>

                    <td colspan="7">
                        هیچ دوایی در این فاکتور وجود ندارد
                    </td>

                </tr>

            `;

            return;

        }


        items.forEach(
            (item, index) => {

                const row =
                    document.createElement(
                        'tr'
                    );


                row.innerHTML = `

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${item.product_code || '-'}
                    </td>

                  <td>

    ${item.product_name || '-'}

    <br>

   <small class="batch-info">
    بچ: ${item.batch_number || '-'}
    |
    انقضا: ${item.expiry_date || '-'}
</small>

</td>

                    <td>
                        ${item.product_unit || '-'}
                    </td>

                    <td>
                        ${item.quantity}
                    </td>

                    <td>
                        ${formatMoney(
                            item.sale_price
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            item.total_price
                        )}
                    </td>

                `;


                saleItemsBody.appendChild(
                    row
                );

            }
        );


        /* =====================
           متن پایین فاکتور
        ===================== */

        applyInvoiceFooter();


    } catch (error) {

        console.error(error);

        alert(
            'ارتباط با سرور برقرار نشد'
        );

    }

}


/* =========================
   شروع
========================= */

async function init() {

    await loadInvoiceSettings();

    applyInvoiceFooter();

    await loadSale();

}


init();