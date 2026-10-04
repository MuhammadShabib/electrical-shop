const express = require('express');
const router = express.Router();

const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const pool = require('../config/database');


/* =====================================================
   تنظیمات
===================================================== */

const backupDir =
    path.join(
        __dirname,
        '../../backups'
    );


/* =========================
   ایجاد پوشه بکاپ
========================= */

if (!fs.existsSync(backupDir)) {

    fs.mkdirSync(
        backupDir,
        {
            recursive: true
        }
    );

}


/* =========================
   آپلود فایل SQL
========================= */

const upload =
    multer({
        dest: backupDir,

        fileFilter: (
            req,
            file,
            cb
        ) => {

            if (
                path.extname(
                    file.originalname
                ).toLowerCase() !== '.sql'
            ) {

                return cb(
                    new Error(
                        'فقط فایل SQL مجاز است'
                    )
                );

            }

            cb(
                null,
                true
            );

        },

        limits: {
            fileSize:
                100 * 1024 * 1024
        }

    });


/* =====================================================
   تابع دریافت تنظیمات دیتابیس
===================================================== */

async function getDatabaseConfig() {

    const connection =
        await pool.getConnection();

    try {

        const connectionConfig =
            connection.config || {};


        return {

            host:
                connectionConfig.host ||
                'localhost',

            user:
                connectionConfig.user ||
                'root',

            password:
                connectionConfig.password ||
                '',

            database:
                connectionConfig.database ||
                'electrical_shop',

            port:
                connectionConfig.port ||
                3306

        };

    } finally {

        connection.release();

    }

}


/* =====================================================
   ایجاد بکاپ
===================================================== */

router.get(
    '/backup',
    async (req, res) => {

        try {

            const db =
                await getDatabaseConfig();


            const now =
                new Date();


            const timestamp =
                [
                    now.getFullYear(),

                    String(
                        now.getMonth() + 1
                    ).padStart(2, '0'),

                    String(
                        now.getDate()
                    ).padStart(2, '0'),

                    '_',

                    String(
                        now.getHours()
                    ).padStart(2, '0'),

                    String(
                        now.getMinutes()
                    ).padStart(2, '0'),

                    String(
                        now.getSeconds()
                    ).padStart(2, '0')
                ]
                .join('');


            const fileName =
                `electrical_shop_${timestamp}.sql`;


            const filePath =
                path.join(
                    backupDir,
                    fileName
                );


            const args = [

                '-h',
                db.host,

                '-P',
                String(db.port),

                '-u',
                db.user,

                `-p${db.password}`,

                '--routines',

                '--triggers',

                '--events',

                db.database

            ];


            execFile(
                'mysqldump',
                args,
                {
                    windowsHide: true,

                    maxBuffer:
                        1024 * 1024 * 20
                },
                (
                    error,
                    stdout,
                    stderr
                ) => {

                    if (error) {

                        console.error(
                            'mysqldump error:',
                            error
                        );

                        return res.status(
                            500
                        ).json({

                            success:
                                false,

                            message:
                                'ایجاد بکاپ انجام نشد',

                            error:
                                stderr ||
                                error.message

                        });

                    }


                    fs.writeFile(
                        filePath,
                        stdout,
                        'utf8',
                        writeError => {

                            if (writeError) {

                                console.error(
                                    writeError
                                );

                                return res.status(
                                    500
                                ).json({

                                    success:
                                        false,

                                    message:
                                        'ذخیره فایل بکاپ انجام نشد',

                                    error:
                                        writeError.message

                                });

                            }


                            res.download(
                                filePath,
                                fileName,
                                downloadError => {

                                    if (
                                        downloadError
                                    ) {

                                        console.error(
                                            downloadError
                                        );

                                    }

                                }
                            );

                        }
                    );

                }
            );

        } catch (error) {

            console.error(
                'Backup error:',
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    'ایجاد بکاپ انجام نشد',

                error:
                    error.message

            });

        }

    }
);


/* =====================================================
   بازیابی بکاپ
===================================================== */

router.post(
    '/restore',
    upload.single('backup'),
    async (req, res) => {

        let uploadedFilePath =
            null;


        try {

            if (!req.file) {

                return res.status(
                    400
                ).json({

                    success:
                        false,

                    message:
                        'فایل بکاپ انتخاب نشده است'

                });

            }


            uploadedFilePath =
                req.file.path;


            const db =
                await getDatabaseConfig();


            const sqlContent =
                fs.readFileSync(
                    uploadedFilePath,
                    'utf8'
                );


            if (
                !sqlContent.trim()
            ) {

                throw new Error(
                    'فایل بکاپ خالی است'
                );

            }


            /*
             * هشدار:
             * بازیابی، اطلاعات فعلی دیتابیس
             * را با محتوای فایل بکاپ جایگزین می‌کند.
             */


            const args = [

                '-h',
                db.host,

                '-P',
                String(db.port),

                '-u',
                db.user,

                `-p${db.password}`,

                db.database

            ];


            await new Promise(
                (
                    resolve,
                    reject
                ) => {

                    const child =
                        require('child_process')
                            .spawn(
                                'mysql',
                                args,
                                {
                                    windowsHide:
                                        true
                                }
                            );


                    let stderr =
                        '';


                    child.stderr.on(
                        'data',
                        data => {

                            stderr +=
                                data.toString();

                        }
                    );


                    child.stdin.write(
                        sqlContent
                    );


                    child.stdin.end();


                    child.on(
                        'close',
                        code => {

                            if (code !== 0) {

                                reject(
                                    new Error(
                                        stderr ||
                                        `mysql با کد ${code} متوقف شد`
                                    )
                                );

                                return;

                            }


                            resolve();

                        }
                    );


                    child.on(
                        'error',
                        error => {

                            reject(
                                error
                            );

                        }
                    );

                }
            );


            res.json({

                success:
                    true,

                message:
                    'بکاپ با موفقیت بازیابی شد'

            });


        } catch (error) {

            console.error(
                'Restore error:',
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    'بازیابی بکاپ انجام نشد',

                error:
                    error.message

            });

        } finally {

            if (
                uploadedFilePath &&
                fs.existsSync(
                    uploadedFilePath
                )
            ) {

                fs.unlink(
                    uploadedFilePath,
                    error => {

                        if (error) {

                            console.error(
                                'Delete uploaded backup error:',
                                error
                            );

                        }

                    }
                );

            }

        }

    }
);


module.exports = router;