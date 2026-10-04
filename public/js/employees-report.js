let employees = [];

let employeeAccounts = [];


/* =========================
   عناصر صفحه
========================= */

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


const printReportBtn =
    document.getElementById(
        'printReportBtn'
    );


const reportMessage =
    document.getElementById(
        'reportMessage'
    );


const employeesReportBody =
    document.getElementById(
        'employeesReportBody'
    );


const employeeCount =
    document.getElementById(
        'employeeCount'
    );


const totalSalary =
    document.getElementById(
        'totalSalary'
    );


const totalWithdrawals =
    document.getElementById(
        'totalWithdrawals'
    );


const totalSalaryPayments =
    document.getElementById(
        'totalSalaryPayments'
    );


const totalBalance =
    document.getElementById(
        'totalBalance'
    );


const transactionCount =
    document.getElementById(
        'transactionCount'
    );


const printDateRange =
    document.getElementById(
        'printDateRange'
    );


/* =========================
   فرمت مبلغ
========================= */

function formatMoney(value) {

    const number =
        Number(value || 0);


    const settings =
        window.systemSettings || {};


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

}


/* =========================
   تاریخ
========================= */

function getDatePart(value) {

    if (!value) {
        return '';
    }


    const text =
        String(value);


    const match =
        text.match(
            /\d{4}-\d{2}-\d{2}/
        );


    if (match) {

        return match[0];

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return '';

    }


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            '0'
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            '0'
        );


    return `${year}-${month}-${day}`;

}


/* =========================
   تاریخ میانبر
========================= */

function getTodayDate() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            '0'
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            '0'
        );


    return `${year}-${month}-${day}`;

}


function getFirstDayOfMonth() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            '0'
        );


    return `${year}-${month}-01`;

}


function getLastDayOfMonth() {

    const now =
        new Date();


    const date =
        new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0
        );


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            '0'
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            '0'
        );


    return `${year}-${month}-${day}`;

}


/* =========================
   بررسی بازه
========================= */

function isInRange(
    value,
    from,
    to
) {

    const datePart =
        getDatePart(value);


    if (!datePart) {

        return false;

    }


    if (
        from &&
        datePart < from
    ) {

        return false;

    }


    if (
        to &&
        datePart > to
    ) {

        return false;

    }


    return true;

}


/* =========================
   محدوده چاپ
========================= */

function updatePrintDateRange() {

    const from =
        fromDate.value;


    const to =
        toDate.value;


    if (
        !from &&
        !to
    ) {

        printDateRange.textContent =
            'همه معاملات';

        return;

    }


    if (
        from &&
        to
    ) {

        printDateRange.textContent =
            `از ${from} تا ${to}`;

        return;

    }


    if (from) {

        printDateRange.textContent =
            `از ${from}`;

        return;

    }


    printDateRange.textContent =
        `تا ${to}`;

}


/* =========================
   دریافت کارمندان
========================= */

async function loadEmployees() {

    const response =
        await fetch(
            '/api/employees'
        );


    const result =
        await response.json();


    if (
        !response.ok ||
        !result.success
    ) {

        throw new Error(
            result.message ||
            'دریافت کارمندان انجام نشد'
        );

    }


    return result.data || [];

}


/* =========================
   دریافت گردش حساب
========================= */

async function loadEmployeeAccount(
    employeeId
) {

    const response =
        await fetch(
            `/api/employees/${employeeId}/transactions`
        );


    const result =
        await response.json();


    if (
        !response.ok ||
        !result.success
    ) {

        throw new Error(
            result.message ||
            'دریافت حساب کارمند انجام نشد'
        );

    }


    return result.data || {};

}


/* =========================
   دریافت اطلاعات
========================= */

async function loadReportData() {

    try {

        reportMessage.textContent =
            'در حال دریافت اطلاعات...';


        employees =
            await loadEmployees();


        employeeAccounts = [];


        const requests =
            employees.map(
                async employee => {

                    const account =
                        await loadEmployeeAccount(
                            employee.id
                        );


                    return {
                        employee,
                        account
                    };

                }
            );


        const results =
            await Promise.all(
                requests
            );


        results.forEach(
            result => {

                employeeAccounts.push(
                    result
                );

            }
        );


        reportMessage.textContent =
            '';


        generateReport();


    } catch (error) {

        console.error(error);


        reportMessage.textContent =
            error.message ||
            'خطا در دریافت اطلاعات';


        employeesReportBody.innerHTML = `

            <tr>

                <td colspan="9">
                    ${error.message}
                </td>

            </tr>

        `;

    }

}


/* =========================
   ساخت گزارش
========================= */

function generateReport() {

    const from =
        fromDate.value;


    const to =
        toDate.value;


    if (
        from &&
        to &&
        from > to
    ) {

        reportMessage.textContent =
            'تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد';

        return;

    }


    reportMessage.textContent =
        '';


    updatePrintDateRange();


    const reportRows =
        employeeAccounts.map(
            item => {

                const employee =
                    item.employee;


                const account =
                    item.account;


                const transactions =
                    account.transactions || [];


                let openingBalance =
                    0;


                let salary =
                    0;


                let withdrawals =
                    0;


                let salaryPayments =
                    0;


                let periodCredits =
                    0;


                let periodDebits =
                    0;


                let count =
                    0;


                /* =========================
                   مانده قبل از بازه
                ========================= */

                if (from) {

                    transactions.forEach(
                        transaction => {

                            const datePart =
                                getDatePart(
                                    transaction.transaction_date
                                );


                            if (
                                !datePart ||
                                datePart >= from
                            ) {

                                return;

                            }


                            const credit =
                                Number(
                                    transaction.credit
                                ) || 0;


                            const debit =
                                Number(
                                    transaction.debit
                                ) || 0;


                            openingBalance +=
                                credit -
                                debit;

                        }
                    );

                }


                /* =========================
                   معاملات داخل بازه
                ========================= */

                transactions.forEach(
                    transaction => {

                        if (
                            !isInRange(
                                transaction.transaction_date,
                                from,
                                to
                            )
                        ) {

                            return;

                        }


                        const credit =
                            Number(
                                transaction.credit
                            ) || 0;


                        const debit =
                            Number(
                                transaction.debit
                            ) || 0;


                        const type =
                            transaction.reference_type ||
                            transaction.type ||
                            '';


                        count++;


                        /* معاش محاسبه شده */

                        if (
                            type === 'salary'
                        ) {

                            salary +=
                                credit;

                        }


                        /* برداشت کارمند */

                        if (
                            type === 'withdrawal'
                        ) {

                            withdrawals +=
                                debit;

                        }


                        /* پرداخت معاش */

                        if (
                            type === 'salary_payment'
                        ) {

                            salaryPayments +=
                                debit;

                        }


                        periodCredits +=
                            credit;


                        periodDebits +=
                            debit;

                    }
                );


                const balance =
                    openingBalance +
                    periodCredits -
                    periodDebits;


                return {

                    employee,

                    openingBalance,

                    salary,

                    withdrawals,

                    salaryPayments,

                    balance,

                    count

                };

            }
        );


    /* =========================
       خلاصه کل
    ========================= */

    let grandSalary =
        0;


    let grandWithdrawals =
        0;


    let grandSalaryPayments =
        0;


    let grandBalance =
        0;


    let grandTransactions =
        0;


    let visibleEmployeeCount =
        0;


    reportRows.forEach(
        row => {

            grandSalary +=
                row.salary;


            grandWithdrawals +=
                row.withdrawals;


            grandSalaryPayments +=
                row.salaryPayments;


            grandBalance +=
                row.balance;


            grandTransactions +=
                row.count;


            if (
                row.count > 0 ||
                row.balance !== 0
            ) {

                visibleEmployeeCount++;

            }

        }
    );


    employeeCount.textContent =
        visibleEmployeeCount;


    totalSalary.textContent =
        formatMoney(
            grandSalary
        );


    totalWithdrawals.textContent =
        formatMoney(
            grandWithdrawals
        );


    totalSalaryPayments.textContent =
        formatMoney(
            grandSalaryPayments
        );


    totalBalance.textContent =
        formatMoney(
            grandBalance
        );


    transactionCount.textContent =
        grandTransactions;


    /* =========================
       جدول
    ========================= */

    employeesReportBody.innerHTML =
        '';


    const visibleRows =
        reportRows.filter(
            row =>
                row.count > 0 ||
                row.balance !== 0
        );


    if (
        visibleRows.length === 0
    ) {

        employeesReportBody.innerHTML = `

            <tr>

                <td colspan="9">

                    در این بازه معامله‌ای برای کارمندان ثبت نشده است

                </td>

            </tr>

        `;

        return;

    }


    visibleRows.forEach(
        (row, index) => {

            const balance =
                row.balance;


            let balanceText =
                formatMoney(
                    Math.abs(balance)
                );


            let status =
                'تسویه';


            if (
                balance > 0
            ) {

                status =
                    'بستانکار';

            }


            if (
                balance < 0
            ) {

                status =
                    'بدهکار';

            }


            if (
                balance === 0
            ) {

                balanceText =
                    '0';

            }


            const employeeName =
                `${row.employee.first_name || ''} ${
                    row.employee.last_name || ''
                }`.trim();


            const tableRow =
                document.createElement(
                    'tr'
                );


            tableRow.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${employeeName || '-'}
                </td>

                <td>
                    ${row.employee.phone || '-'}
                </td>

                <td>
                    ${formatMoney(
                        row.salary
                    )}
                </td>

                <td>
                    ${formatMoney(
                        row.withdrawals
                    )}
                </td>

                <td>
                    ${formatMoney(
                        row.salaryPayments
                    )}
                </td>

                <td>
                    ${balanceText}
                </td>

                <td>
                    ${status}
                </td>

                <td>
                    ${row.count}
                </td>

            `;


            employeesReportBody.appendChild(
                tableRow
            );

        }
    );

}


/* =========================
   دکمه‌ها
========================= */

generateReportBtn.addEventListener(
    'click',
    generateReport
);


todayBtn.addEventListener(
    'click',
    function () {

        const today =
            getTodayDate();


        fromDate.value =
            today;


        toDate.value =
            today;


        generateReport();

    }
);


thisMonthBtn.addEventListener(
    'click',
    function () {

        fromDate.value =
            getFirstDayOfMonth();


        toDate.value =
            getLastDayOfMonth();


        generateReport();

    }
);


clearDateBtn.addEventListener(
    'click',
    function () {

        fromDate.value =
            '';


        toDate.value =
            '';


        generateReport();

    }
);


printReportBtn.addEventListener(
    'click',
    function () {

        updatePrintDateRange();

        window.print();

    }
);


/* =========================
   شروع
========================= */

async function initEmployeeReport() {

    while (
        !window.systemSettings
    ) {

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    50
                )
        );

    }


    await loadReportData();

}


initEmployeeReport();