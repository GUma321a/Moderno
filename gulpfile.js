//3 шага для подключения плагина

const   {   src, dest, watch, parallel, series }     =     require('gulp');
//1. Задаем имя плагина

const   scss         =   require('gulp-sass');
const   concat       =   require('gulp-concat');
const   browserSync  =   require('browser-sync').create();
const   uglify       =   require('gulp-uglify-es').default;
const   autoprefixer =   require('gulp-autoprefixer');
const   imagemin     =   require('gulp-imagemin');
const   del          =   require('del');
const   cssmin       =   require('gulp-cssmin');

//2. Задаем функции

function browsersync() {                                           //Автообновление страницы
    browserSync.init({
        server : {
            baseDir: 'app/'
        },
        notify: false                                              //Отключает иконку обновления браузера
    });
}

function cleanDist(){
    return del('dist')
}

function build(){                                                  //Перенос файлов
    return src([
        'app/css/style.min.css',
        'app/css/libs.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/js/libs.min.js',
        'app/*.html'
    ], {base: 'app'})                                              //Переносфайлов с папками
    .pipe(dest('dist'))                                            //Путь переноса
}

function images(){                                                 //Сжатие изображений
    return src('app/img/**/*')
        .pipe(imagemin([                                          //Настройка сжатости изображений
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(dest('dist/img'))
}

function js(){                                                //Минифицырование js
    return src('app/js/main.js')
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}
function scripts(){                                                //Минифицырование js
    return src([
    'node_modules/jquery/dist/jquery.min.js'
])
    .pipe(concat('libs.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function sass(){                                                   //Минифицырование scss
    return src(
        'app/scss/style.scss')
        .pipe(scss({outputStyle: 'compressed'}))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({                                        //Отслежка старых браузеров(что бы работало на старых версиях)
            overrideBrowserlist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}
function styles(){                                                   //Минифицырование scss
    return src([
        'node_modules/normalize.css/normalize.css',
    ])
        .pipe(concat('libs.min.css'))
        .pipe(cssmin())
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}


function watching(){                                                  //Слежение за изменениями в файлах
    watch(['app/scss/**/*.scss'], sass, styles)
    watch(['app/js/**/*.js', '!app/js/main.min.js'], js, scripts)
    watch(['app/*.html']).on('change', browserSync.reload);
}


//3. Включаем в работу терминала

exports.styles      = styles;
exports.sass        = sass;
exports.watching    = watching;
exports.browsersync = browsersync;
exports.js          = js;
exports.scripts     = scripts;
exports.images      = images;
exports.cleanDist   = cleanDist;


exports.build       = series(cleanDist, images, build);                           //Последовательность
exports.default     = parallel(styles, sass, js, scripts, browsersync, watching);           //Паралельная  работа