const expenseForm =
    document.getElementById(
        'expenseForm'
    );

const titleInput =
    document.getElementById(
        'title'
    );

const amountInput =
    document.getElementById(
        'amount'
    );

const expenseDateInput =
    document.getElementById(
        'expenseDate'
    );

const descriptionInput =
    document.getElementById(
        'description'
    );

const message =
    document.getElementById(
        'message'
    );

const expensesBody =
    document.getElementById(
        'expensesBody'
    );

const expenseCount =
    document.getElementById(
        'expenseCount'
    );

const totalExpenses =
    document.getElementById(
        'totalExpenses'
    );


let expenses = [];


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
   دریافت هزینه‌ها
========================= */

async function loadExpenses() {

    try {

        const response =
            await fetch(
                '/api/expenses'
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                'خطا در دریافت هزینه‌ها'
            );

        }


        expenses =
            result.data || [];


        renderExpenses();


    } catch (error) {

        console.error(error);


        expensesBody.innerHTML = `

            <tr>

                <td colspan="5">
                    ${error.message}
                </td>

            </tr>

        `;

    }

}


/* =========================
   نمایش هزینه‌ها
========================= */

function renderExpenses() {

    expensesBody.innerHTML =
        '';


    let total =
        0;


    expenses.forEach(
        (expense, index) => {

            const amount =
                Number(
                    expense.amount
                ) || 0;


            total += amount;


            const row =
                document.createElement(
                    'tr'
                );


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${expense.title || '-'}
                </td>

                <td>
                    ${formatMoney(amount)}
                </td>

                <td>
                    ${formatDate(
                        expense.expense_date
                    )}
                </td>

                <td>
                    ${
                        expense.description ||
                        '-'
                    }
                </td>

            `;


            expensesBody.appendChild(
                row
            );

        }
    );


    if (expenses.length === 0) {

        expensesBody.innerHTML = `

            <tr>

                <td colspan="5">
                    هنوز هزینه‌ای ثبت نشده است
                </td>

            </tr>

        `;

    }


    expenseCount.textContent =
        expenses.length;


    totalExpenses.textContent =
        formatMoney(total);

}


/* =========================
   ثبت هزینه
========================= */

expenseForm.addEventListener(
    'submit',
    async function (event) {

        event.preventDefault();


        const title =
            titleInput.value.trim();

        const amount =
            Number(
                amountInput.value
            );

        const expenseDate =
            expenseDateInput.value;

        const description =
            descriptionInput.value.trim();


        if (!title) {

            alert(
                'عنوان هزینه را وارد کنید'
            );

            return;

        }


        if (!amount || amount <= 0) {

            alert(
                'مبلغ هزینه معتبر نیست'
            );

            return;

        }


        try {

            message.textContent =
                'در حال ثبت هزینه...';


            const response =
                await fetch(
                    '/api/expenses',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify({

                                title,

                                amount,

                                expense_date:
                                    expenseDate ||
                                    null,

                                description:
                                    description ||
                                    null

                            })

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
                    'ثبت هزینه انجام نشد'
                );

            }


            alert(
                'هزینه با موفقیت ثبت شد'
            );


            expenseForm.reset();

            message.textContent =
                '';


            await loadExpenses();


        } catch (error) {

            console.error(error);


            message.textContent =
                error.message ||
                'خطا در ثبت هزینه';

        }

    }
);


/* =========================
   شروع
========================= */

loadExpenses();