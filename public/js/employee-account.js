/* =========================
   شناسه کارمند
========================= */

const params =
    new URLSearchParams(
        window.location.search
    );


const employeeId =
    Number(
        params.get('id')
    );



/* =========================
   عناصر صفحه
========================= */

const employeeName =
    document.getElementById(
        'employeeName'
    );


const employeePhone =
    document.getElementById(
        'employeePhone'
    );


const employeeSalary =
    document.getElementById(
        'employeeSalary'
    );


const employeeWorkTime =
    document.getElementById(
        'employeeWorkTime'
    );


const totalDebit =
    document.getElementById(
        'totalDebit'
    );


const totalCredit =
    document.getElementById(
        'totalCredit'
    );


const balanceAmount =
    document.getElementById(
        'balanceAmount'
    );


const balanceType =
    document.getElementById(
        'balanceType'
    );


const transactionsTableBody =
    document.getElementById(
        'transactionsTableBody'
    );


const transactionFormContainer =
    document.getElementById(
        'transactionFormContainer'
    );


const transactionForm =
    document.getElementById(
        'transactionForm'
    );


const transactionFormTitle =
    document.getElementById(
        'transactionFormTitle'
    );


const transactionAmount =
    document.getElementById(
        'transactionAmount'
    );


const transactionDescription =
    document.getElementById(
        'transactionDescription'
    );


const cancelTransactionBtn =
    document.getElementById(
        'cancelTransactionBtn'
    );


const addSalaryBtn =
    document.getElementById(
        'addSalaryBtn'
    );


const addWithdrawalBtn =
    document.getElementById(
        'addWithdrawalBtn'
    );


const addSalaryPaymentBtn =
    document.getElementById(
        'addSalaryPaymentBtn'
    );


    const salaryMonthContainer =
    document.getElementById(
        'salaryMonthContainer'
    );

const salaryMonth =
    document.getElementById(
        'salaryMonth'
    );

    const salaryMonthName =
    document.getElementById('salaryMonthName');

    const persianMonths = {
    '01': 'حمل',
    '02': 'ثور',
    '03': 'جوزا',
    '04': 'سرطان',
    '05': 'اسد',
    '06': 'سنبله',
    '07': 'میزان',
    '08': 'عقرب',
    '09': 'قوس',
    '10': 'جدی',
    '11': 'دلو',
    '12': 'حوت'
};


function updateSalaryMonthName() {

    const value =
        salaryMonth.value.trim();

    if (!/^\d{4}\/\d{2}$/.test(value)) {

        salaryMonthName.textContent =
            '-';

        return;
    }

    const month =
        value.substring(5, 7);

    salaryMonthName.textContent =
        persianMonths[month] || '-';
}


salaryMonth.addEventListener(
    'input',
    updateSalaryMonthName
);

let employee = null;

let transactionKind = null;



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


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleDateString(
        'fa-IR'
    );

}



/* =========================
   دریافت اطلاعات حساب
========================= */

async function loadAccount() {

    try {

        const response =
            await fetch(
                `/api/employees/${employeeId}/account`
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            alert(
                result.message ||
                'خطا در دریافت حساب کارمند'
            );

            return;

        }


        employee =
            result.data.employee;


        employeeName.textContent =
            `${employee.first_name}
             ${employee.last_name}`;


        employeePhone.textContent =
            employee.phone || '-';


        employeeSalary.textContent =
            formatMoney(
                employee.salary
            );


        employeeWorkTime.textContent =
            employee.work_time || '-';


        totalDebit.textContent =
            formatMoney(
                result.data.total_debit
            );


        totalCredit.textContent =
            formatMoney(
                result.data.total_credit
            );


        balanceAmount.textContent =
            formatMoney(
                Math.abs(
                    Number(
                        result.data.balance
                    ) || 0
                )
            );


        balanceType.classList.remove(
            'balance-credit',
            'balance-debit',
            'balance-settled'
        );


        if (
            result.data.balance_type ===
            'credit'
        ) {

            balanceType.textContent =
                'طلبکار';


            balanceType.classList.add(
                'balance-credit'
            );

        }

        else if (
            result.data.balance_type ===
            'debit'
        ) {

            balanceType.textContent =
                'بدهکار';


            balanceType.classList.add(
                'balance-debit'
            );

        }

        else {

            balanceType.textContent =
                'تسویه';


            balanceType.classList.add(
                'balance-settled'
            );

        }


    } catch (error) {

        console.error(error);

        alert(
            'ارتباط با سرور برقرار نشد'
        );

    }

}



/* =========================
   دریافت گردش حساب
========================= */

async function loadTransactions() {

    try {

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

            alert(
                result.message ||
                'خطا در دریافت گردش حساب'
            );

            return;

        }


        const transactions =
            result.data || [];


        transactionsTableBody.innerHTML =
            '';


        if (
            transactions.length === 0
        ) {

            transactionsTableBody.innerHTML = `

                <tr>

                    <td colspan="6">

                        هنوز تراکنشی ثبت نشده است

                    </td>

                </tr>

            `;

            return;

        }


        let runningBalance = 0;


        transactions.forEach(
            transaction => {

                const amount =
                    Number(
                        transaction.amount
                    ) || 0;


                if (
                    transaction.type ===
                    'credit'
                ) {

                    runningBalance +=
                        amount;

                }

                else {

                    runningBalance -=
                        amount;

                }


                const row =
                    document.createElement(
                        'tr'
                    );


                const balanceValue =
                    Math.abs(
                        runningBalance
                    );


                const balanceText =
                    runningBalance > 0

                    ? `${formatMoney(
                        balanceValue
                    )} طلبکار`

                    : runningBalance < 0

                    ? `${formatMoney(
                        balanceValue
                    )} بدهکار`

                    : '0 تسویه';


                row.innerHTML = `

                    <td>
                        ${formatDate(
                            transaction.transaction_date ||
                            transaction.created_at
                        )}
                    </td>


                    <td>
                        ${transaction.description || '-'}
                    </td>

                    <td>
    ${
        transaction.salary_month
            ? `${transaction.salary_month} — ${
                persianMonths[
                    transaction.salary_month.substring(5, 7)
                ] || ''
            }`
            : '-'
    }
</td>

                    <td>

                        ${
                            transaction.type ===
                            'debit'

                            ? formatMoney(
                                amount
                              )

                            : '-'
                        }

                    </td>


                    <td>

                        ${
                            transaction.type ===
                            'credit'

                            ? formatMoney(
                                amount
                              )

                            : '-'
                        }

                    </td>


                    <td>
                        ${balanceText}
                    </td>

                `;


                transactionsTableBody
                    .appendChild(
                        row
                    );

            }
        );


    } catch (error) {

        console.error(error);

        alert(
            'خطا در دریافت گردش حساب کارمند'
        );

    }

}



/* =========================
   باز کردن فرم معاش
========================= */

addSalaryBtn.addEventListener(
    'click',
    () => {

        transactionKind =
            'salary';

            salaryMonthContainer.style.display = 'block';

const now = new Date();

const parts =
    new Intl.DateTimeFormat(
        'en-US-u-ca-persian',
        {
            year: 'numeric',
            month: '2-digit'
        }
    ).formatToParts(now);

const year =
    parts.find(
        part => part.type === 'year'
    ).value;

const month =
    parts.find(
        part => part.type === 'month'
    ).value;

salaryMonth.value =
    `${year}/${month}`;

updateSalaryMonthName();

        transactionFormTitle.textContent =
            'محاسبه معاش';


        transactionAmount.value =
            employee
            ? Number(
                employee.salary
            ) || 0
            : 0;


        transactionDescription.value =
            'معاش ماهانه';


        transactionFormContainer
            .classList
            .remove('hidden');


        transactionAmount.focus();

    }
);



/* =========================
   باز کردن فرم برداشت
========================= */

addWithdrawalBtn.addEventListener(
    'click',
    () => {

        transactionKind =
            'withdrawal';
            salaryMonthContainer.style.display =
            'none';


        transactionFormTitle.textContent =
            'ثبت برداشت کارمند';


        transactionAmount.value =
            '';


        transactionDescription.value =
            '';


        transactionFormContainer
            .classList
            .remove('hidden');


        transactionAmount.focus();

    }
);



/* =========================
   باز کردن فرم پرداخت معاش
========================= */

addSalaryPaymentBtn.addEventListener(
    'click',
    () => {

        transactionKind =
            'salary_payment';
            salaryMonthContainer.style.display =
    'none';


        transactionFormTitle.textContent =
            'ثبت پرداخت معاش';


        transactionAmount.value =
            '';


        transactionDescription.value =
            'پرداخت معاش';


        transactionFormContainer
            .classList
            .remove('hidden');


        transactionAmount.focus();

    }
);



/* =========================
   بستن فرم
========================= */

cancelTransactionBtn.addEventListener(
    'click',
    () => {

        transactionKind =
            null;


        transactionForm.reset();


        transactionFormContainer
            .classList
            .add('hidden');

    }
);



/* =========================
   ثبت تراکنش
========================= */

transactionForm.addEventListener(
    'submit',
    async event => {

        event.preventDefault();


        if (!transactionKind) {

            alert(
                'نوع تراکنش مشخص نیست'
            );

            return;

        }


        const amount =
            Number(
                transactionAmount.value
            );


        const description =
            transactionDescription.value
                .trim();


        if (
            !amount ||
            amount <= 0
        ) {

            alert(
                'مبلغ باید بیشتر از صفر باشد'
            );

            return;

        }


        try {

            const response =
                await fetch(
                    `/api/employees/${employeeId}/transactions`,
                    {

                        method: 'POST',

                        headers: {

                            'Content-Type':
                                'application/json'

                        },

                      body: JSON.stringify({
    kind: transactionKind,
    amount: amount,
    description: description,
    salary_month:
        transactionKind === 'salary'
            ? salaryMonth.value
            : null
})

                    }
                );


            const result =
                await response.json();


            if (
                !response.ok ||
                !result.success
            ) {

                alert(
                    result.message ||
                    'خطا در ثبت تراکنش'
                );

                return;

            }


            alert(
                'تراکنش با موفقیت ثبت شد'
            );


            transactionKind =
                null;


            transactionForm.reset();


            transactionFormContainer
                .classList
                .add('hidden');


            await loadAccount();

            await loadTransactions();


        } catch (error) {

            console.error(error);

            alert(
                'خطا در ثبت تراکنش'
            );

        }

    }
);



/* =========================
   بررسی شناسه
========================= */

if (!employeeId) {

    alert(
        'شناسه کارمند معتبر نیست'
    );

    window.location.href =
        '/employees.html';

}

else {

    loadAccount();

    loadTransactions();

}