let customers = [];


/* =========================
   عناصر صفحه
========================= */

const tableBody =
    document.getElementById(
        'customersTableBody'
    );

const searchInput =
    document.getElementById(
        'searchInput'
    );

const customerCount =
    document.getElementById(
        'customerCount'
    );

const totalDebit =
    document.getElementById(
        'totalDebit'
    );

const totalCredit =
    document.getElementById(
        'totalCredit'
    );


/* =========================
   فرمت مبلغ
========================= */

function formatMoney(value) {

    return Number(value || 0)
        .toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });

}


/* =========================
   دریافت مشتریان
========================= */

async function loadCustomers() {

    try {

        const response =
            await fetch('/api/customers');


        const result =
            await response.json();


        if (!response.ok ||
            !result.success) {

            tableBody.innerHTML = `

                <tr>

                    <td colspan="8">

                        ${
                            result.message ||
                            'خطا در دریافت مشتریان'
                        }

                    </td>

                </tr>

            `;

            return;

        }


        customers =
            result.data || [];


        renderCustomers();


    } catch (error) {

        console.error(error);


        tableBody.innerHTML = `

            <tr>

                <td colspan="8">
                    ارتباط با سرور برقرار نشد
                </td>

            </tr>

        `;

    }

}


/* =========================
   نمایش مشتریان
========================= */

function renderCustomers() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const filtered =
        customers.filter(customer => {

            const name =
                String(
                    customer.name || ''
                ).toLowerCase();


            const phone =
                String(
                    customer.phone || ''
                ).toLowerCase();


            return (
                name.includes(search) ||
                phone.includes(search)
            );

        });


    tableBody.innerHTML = '';


    if (filtered.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td colspan="8">
                    هیچ مشتری پیدا نشد
                </td>

            </tr>

        `;

        updateSummary(filtered);

        return;

    }


    filtered.forEach(
        (customer, index) => {

            const debit =
                Number(
                    customer.debit
                ) || 0;


            const credit =
                Number(
                    customer.credit
                ) || 0;


            const balance =
                debit - credit;


            let status =
                'تسویه';


            if (balance > 0) {

                status =
                    'بدهکار';

            }
            else if (balance < 0) {

                status =
                    'بستانکار';

            }


            const row =
                document.createElement(
                    'tr'
                );


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${customer.name || '-'}
                </td>

                <td>
                    ${customer.phone || '-'}
                </td>

                <td>
                    ${formatMoney(debit)}
                </td>

                <td>
                    ${formatMoney(credit)}
                </td>

                <td>
                    ${formatMoney(
                        Math.abs(balance)
                    )}
                </td>

                <td>
                    ${status}
                </td>

                <td>

                    <button
                        type="button"
                        onclick="viewCustomer(${customer.id})">

                        گردش حساب

                    </button>

                </td>

            `;


            tableBody.appendChild(row);

        }
    );


    updateSummary(filtered);

}


/* =========================
   خلاصه حساب‌ها
========================= */

function updateSummary(list) {

    let debitTotal = 0;

    let creditTotal = 0;


    list.forEach(customer => {

        debitTotal +=
            Number(
                customer.debit
            ) || 0;


        creditTotal +=
            Number(
                customer.credit
            ) || 0;

    });


    customerCount.textContent =
        list.length;


    totalDebit.textContent =
        formatMoney(debitTotal);


    totalCredit.textContent =
        formatMoney(creditTotal);

}


/* =========================
   جستجو
========================= */

searchInput.addEventListener(
    'input',
    renderCustomers
);


/* =========================
   گردش حساب مشتری
========================= */

function viewCustomer(id) {

    window.location.href =
        `/customer-details.html?id=${id}`;

}


/* =========================
   شروع
========================= */

loadCustomers();