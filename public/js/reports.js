const fromDate =
    document.getElementById('fromDate');

const toDate =
    document.getElementById('toDate');

const generateReportBtn =
    document.getElementById(
        'generateReportBtn'
    );

const todayBtn =
    document.getElementById(
        'todayBtn'
    );

const thisMonthBtn =
    document.getElementById(
        'thisMonthBtn'
    );

const clearDateBtn =
    document.getElementById(
        'clearDateBtn'
    );

const totalSales =
    document.getElementById(
        'totalSales'
    );

const totalDiscount =
    document.getElementById(
        'totalDiscount'
    );

const netSales =
    document.getElementById(
        'netSales'
    );

const costOfGoodsSold =
    document.getElementById(
        'costOfGoodsSold'
    );

const grossProfit =
    document.getElementById(
        'grossProfit'
    );

const totalExpenses =
    document.getElementById(
        'totalExpenses'
    );

const netProfit =
    document.getElementById(
        'netProfit'
    );

const cashBalance =
    document.getElementById(
        'cashBalance'
    );

const salesCount =
    document.getElementById(
        'salesCount'
    );

const expensesCount =
    document.getElementById(
        'expensesCount'
    );

const reportMessage =
    document.getElementById(
        'reportMessage'
    );


    const reportSalesBody =
    document.getElementById(
        'reportSalesBody'
    );

const reportPurchasesBody =
    document.getElementById(
        'reportPurchasesBody'
    );

const reportReturnsBody =
    document.getElementById(
        'reportReturnsBody'
    );
/* =========================
   فرمت مبلغ
========================= */

function formatMoney(value) {

    return Number(value || 0)
        .toLocaleString(
            'en-US',
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
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


    if (Number.isNaN(
        date.getTime()
    )) {

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
   دریافت گزارش
========================= */

async function loadReport() {

    try {

        reportMessage.textContent =
            'در حال دریافت گزارش...';


        const params =
            new URLSearchParams();


        if (fromDate.value) {

            params.append(
                'from',
                fromDate.value
            );

        }


        if (toDate.value) {

            params.append(
                'to',
                toDate.value
            );

        }


        const url =
            params.toString()
                ? `/api/reports?${params.toString()}`
                : '/api/reports';


        const response =
            await fetch(url);


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                'دریافت گزارش انجام نشد'
            );

        }


        const data =
            result.data || {};

const detailsResponse =
    await fetch(
        params.toString()
            ? `/api/report-details?${params.toString()}`
            : '/api/report-details'
    );

const detailsResult =
    await detailsResponse.json();


if (
    !detailsResponse.ok ||
    !detailsResult.success
) {

    throw new Error(
        detailsResult.message ||
        'دریافت جزئیات گزارش انجام نشد'
    );

}


const details =
    detailsResult.data || {};

    /* =========================
   نمایش جزئیات فروش‌ها
========================= */

reportSalesBody.innerHTML = '';


const salesList =
    details.sales || [];


if (salesList.length === 0) {

    reportSalesBody.innerHTML = `

        <tr>

            <td colspan="6">
                در این بازه فروشی ثبت نشده است
            </td>

        </tr>

    `;

} else {

    salesList.forEach(
        sale => {

            const row =
                document.createElement('tr');


            row.innerHTML = `

                <td>
                    ${sale.invoice_number || '-'}
                </td>

                <td>
                    ${sale.customer_name || 'مشتری متفرقه'}
                </td>

                <td>
                    ${formatMoney(
                        sale.total_amount
                    )}
                </td>

                <td>
                    ${formatMoney(
                        sale.discount
                    )}
                </td>

                <td>
                    ${formatMoney(
                        sale.paid_amount
                    )}
                </td>

                <td>
                    ${formatDate(
                        sale.sale_date
                    )}
                </td>

            `;


            reportSalesBody.appendChild(
                row
            );

        }
    );

}


/* =========================
   نمایش جزئیات خریدها
========================= */

reportPurchasesBody.innerHTML = '';


const purchasesList =
    details.purchases || [];


if (purchasesList.length === 0) {

    reportPurchasesBody.innerHTML = `

        <tr>

            <td colspan="6">
                در این بازه خریدی ثبت نشده است
            </td>

        </tr>

    `;

} else {

    purchasesList.forEach(
        purchase => {

            const row =
                document.createElement('tr');


            row.innerHTML = `

                <td>
                    ${purchase.invoice_number || '-'}
                </td>

                <td>
                    ${purchase.supplier_name || 'شرکت متفرقه'}
                </td>

                <td>
                    ${formatMoney(
                        purchase.total_amount
                    )}
                </td>

                <td>
                    ${formatMoney(
                        purchase.paid_amount
                    )}
                </td>

                <td>
                    ${formatMoney(
                        purchase.remaining_amount
                    )}
                </td>

                <td>
                    ${formatDate(
                        purchase.purchase_date
                    )}
                </td>

            `;


            reportPurchasesBody.appendChild(
                row
            );

        }
    );

}


/* =========================
   نمایش جزئیات برگشت‌ها
========================= */

reportReturnsBody.innerHTML = '';


const saleReturns =
    details.sale_returns || [];


const purchaseReturns =
    details.purchase_returns || [];


const returnsList = [

    ...saleReturns.map(
        item => ({

            type:
                'برگشت فروش',

            invoice_number:
                item.invoice_number,

            party:
                item.customer_name ||
                'مشتری متفرقه',

            amount:
                item.total_amount,

            refund:
                item.refund_amount || 0,

            date:
                item.return_date

        })
    ),

    ...purchaseReturns.map(
        item => ({

            type:
                'برگشت خرید',

            invoice_number:
                item.invoice_number,

            party:
                item.supplier_name ||
                'شرکت متفرقه',

            amount:
                item.total_amount,

            refund:
                0,

            date:
                item.return_date

        })
    )

];


if (returnsList.length === 0) {

    reportReturnsBody.innerHTML = `

        <tr>

            <td colspan="6">
                در این بازه برگشتی ثبت نشده است
            </td>

        </tr>

    `;

} else {

    returnsList.forEach(
        item => {

            const row =
                document.createElement('tr');


            row.innerHTML = `

                <td>
                    ${item.type}
                </td>

                <td>
                    ${item.invoice_number || '-'}
                </td>

                <td>
                    ${item.party}
                </td>

                <td>
                    ${formatMoney(
                        item.amount
                    )}
                </td>

                <td>
                    ${formatMoney(
                        item.refund
                    )}
                </td>

                <td>
                    ${formatDate(
                        item.date
                    )}
                </td>

            `;


            reportReturnsBody.appendChild(
                row
            );

        }
    );

}
        /* =========================
           نمایش اطلاعات
        ========================= */

        totalSales.textContent =
            formatMoney(
                data.gross_sales
            ) + ' افغانی';


        totalDiscount.textContent =
            formatMoney(
                data.total_discount
            ) + ' افغانی';


        netSales.textContent =
            formatMoney(
                data.net_sales
            ) + ' افغانی';


        costOfGoodsSold.textContent =
            formatMoney(
                data.cost_of_goods_sold
            ) + ' افغانی';


        grossProfit.textContent =
            formatMoney(
                data.gross_profit
            ) + ' افغانی';


        totalExpenses.textContent =
            formatMoney(
                data.total_expenses
            ) + ' افغانی';


        netProfit.textContent =
            formatMoney(
                data.net_profit
            ) + ' افغانی';


        cashBalance.textContent =
            formatMoney(
                data.cash_balance
            ) + ' افغانی';


        salesCount.textContent =
            Number(
                data.sales_count || 0
            );


        expensesCount.textContent =
            Number(
                data.expenses_count || 0
            );


        reportMessage.textContent =
            'گزارش با موفقیت دریافت شد';


    } catch (error) {

        console.error(error);


        reportMessage.textContent =
            error.message ||
            'خطا در دریافت گزارش';

    }

}


/* =========================
   امروز
========================= */

todayBtn.addEventListener(
    'click',
    function () {

        const today =
            new Date();


        const date =
            today.toISOString()
                .split('T')[0];


        fromDate.value =
            date;

        toDate.value =
            date;


        loadReport();

    }
);


/* =========================
   این ماه
========================= */

thisMonthBtn.addEventListener(
    'click',
    function () {

        const today =
            new Date();


        const year =
            today.getFullYear();


        const month =
            String(
                today.getMonth() + 1
            ).padStart(2, '0');


        const firstDay =
            `${year}-${month}-01`;


        const lastDay =
            new Date(
                year,
                today.getMonth() + 1,
                0
            );


        const lastDayString =
            `${year}-${month}-${String(
                lastDay.getDate()
            ).padStart(2, '0')}`;


        fromDate.value =
            firstDay;


        toDate.value =
            lastDayString;


        loadReport();

    }
);


/* =========================
   همه
========================= */

clearDateBtn.addEventListener(
    'click',
    function () {

        fromDate.value =
            '';

        toDate.value =
            '';

        loadReport();

    }
);


/* =========================
   نمایش گزارش
========================= */

generateReportBtn.addEventListener(
    'click',
    loadReport
);


/* =========================
   شروع
========================= */

loadReport();