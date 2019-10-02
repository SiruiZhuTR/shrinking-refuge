// generated on 2016-10-20 using generator-graphics 0.0.1
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync');
const del = require('del');
const wiredep = require('wiredep').stream;
const $ = gulpLoadPlugins();
const reload = browserSync.reload;
const awsConfig = require('./config/aws.json');
const lang = $.util.env.lang || "en"
const requireDir = require('require-dir');

requireDir('./gulp_tasks');

gulp.task('styles', () => {
    return gulp.src('app/styles/**/*.scss')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass.sync({
            outputStyle: 'expanded',
            precision: 10,
            includePaths: ['.']
        }).on('error', $.sass.logError))
        .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('.tmp/styles'))
        .pipe(reload({stream: true}));
});


gulp.task('templates', () => {
    return gulp.src('app/templates/**/*.html')
        .pipe($.templateCompile({
            namespace: "Reuters.Graphics.Template",
            name: function(file){
                return file.relative.split('/').pop().split('.')[0];
            },
            templateSettings: {
                variable: 't'
            }
        }))
        .pipe($.concat('templates.js'))
        .pipe($.babel())
        .pipe(gulp.dest('.tmp/scripts'));
});


gulp.task('scripts', ['templates'], () => {
    return gulp.src(['app/scripts/**/*.js', '!app/scripts/vendor/babel-external-helpers.js' ]) //'!app/scripts/vendor/'
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.babel())
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('.tmp/scripts'));
        //.pipe(reload({stream: true}));
});


function lint(files, options) {
    return gulp.src(files)
        .pipe(reload({stream: true, once: true}))
        .pipe($.eslint(options))
        .pipe($.eslint.format())
        .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}


gulp.task('lint', () => {
    return lint('app/scripts/**/*.js', {
        fix: true
    })
    .pipe(gulp.dest('app/scripts'));
});




gulp.task('compile-html', ['styles', 'scripts','fonts'], () => {
  
    return gulp.src('app/*.html')
        .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
        .pipe(gulp.dest('dist'));
});



gulp.task('localize', ['make-po','images'], () => {
    return gulp.src('dist')
        .pipe($.staticI18n({'localeDirs': ['app/locale'], defaultLang: 'xx'}));
});


gulp.task('cache-breaker', ['localize', 'pathing', 'compile-html'], () => {
    return gulp.src(['dist/*.html', 'dist/locales/**/*.html',])
        .pipe($.replace(/"((scripts|styles|images)\/.*(\.js|\.jpg|\.css))"/g, '"$1?v=' + new Date().getTime() + '"' ))
        .pipe(gulp.dest('dist'))
});


gulp.task('pathing', ['compile-html', 'localize',], () => {
    var input = require('fs').readFileSync('app/locale/'+lang+'/LC_MESSAGES/messages.po');
    var po = require("gettext-parser").po.parse(input);
    var encoded_url = encodeURIComponent(po.translations['']["page_url"].msgstr[0]+"index.html");
    var encoded_headline = encodeURIComponent(po.translations['']["headline"].msgstr[0]);

    return gulp.src(['dist/*.html', 'dist/**/*.html',])
        .pipe($.build({
                'page_url': '',
                'encoded_page_url': encodeURIComponent(''),
                'twitter': "https://twitter.com/intent/tweet?text=" + encoded_headline +"&via=Reuters&url="+encoded_url,
                'facebook': "https://www.facebook.com/sharer/sharer.php?u="+encoded_url
        }))
        .pipe(gulp.dest('dist'));
});



gulp.task('images', () => {
    gulp.src("app/images/share-card.png")
        .pipe($.rename("_gfxpreview.png"))
    	.pipe(gulp.dest("dist/"))
    		
    return gulp.src('app/images/**/*')
        .pipe(gulp.dest('dist/images'));
});



gulp.task('fonts', () => {
    return
 // uncomment to keep local paths to fonts, instead of pointing at cdn   
 //   return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
 //       .concat('app/fonts/**/*'))
 //       .pipe(gulp.dest('.tmp/fonts'))
 //       .pipe(gulp.dest('dist/fonts'));
});



gulp.task('extras', () => {
    return gulp.src([
        'app/*.*',
        '!app/*.html'
    ], {
        dot: true
    }).pipe(gulp.dest('dist'));
});

gulp.task('data', () => {
    return gulp.src([
        'app/data/*.*'
    ], {
        dot: true
    }).pipe(gulp.dest('dist/data'));
});

gulp.task('uglify', ['cache-breaker'],  () => {
    return gulp.src(['dist/**/*'])
        .pipe($.if('*.js', $.uglify().on('error', $.util.log)))
        .pipe($.if('*.css', $.cssnano({safe: true, autoprefixer: false})))
        .pipe(gulp.dest('dist-min'));
         
});



gulp.task('s3-dev', () => {
    var publisher = $.awspublish.create({
        region: awsConfig.dev.region,
        params:{
            Bucket: awsConfig.dev.bucket,
            CacheControl: 'max-age=300',
        },
        //accessKeyId: awsConfig.dev.accessKeyId,
        //secretAccessKey: awsConfig.dev.secretAccessKey,
        
    });
    
    return gulp.src('dist/**/*')
        .pipe($.rename((path) => {
           path.dirname = awsConfig.dev.folder + '/' + path.dirname;
        }))
        .pipe(publisher.publish({
            'Cache-Control': 'max-age=300, public'
        }))
        .pipe($.awspublish.reporter());
});

gulp.task('s3-dist', () => {
    var publisher = $.awspublish.create({
        region: awsConfig.dist.region,
        params:{
            Bucket: awsConfig.dist.bucket,
            CacheControl: 'max-age=300',
        },
        //accessKeyId: awsConfig.dist.accessKeyId,
        //secretAccessKey: awsConfig.dist.secretAccessKey,
    });
    
    return gulp.src('dist-min/**/*')
        .pipe($.rename((path) => {
           path.dirname = awsConfig.dist.folder + '/' + path.dirname;
        }))
        .pipe(publisher.publish({
            'Cache-Control': 'max-age=300, public'
        },
        {
            //force: true
        }))
        .pipe($.awspublish.reporter());
});

gulp.task('s3-graphics', () => {
    var publisher = $.awspublish.create({
        region: awsConfig.graphics.region,
        params:{
            Bucket: awsConfig.graphics.bucket,
            CacheControl: 'max-age=300',
        },
        //accessKeyId: awsConfig.dev.accessKeyId,
        //secretAccessKey: awsConfig.dev.secretAccessKey,
        
    });
     
    return gulp.src('dist/'+lang+'/**/*')   
        .pipe($.rename((path) => {
           path.dirname = "testfiles/"+awsConfig.graphics.folder + '/' + path.dirname;
        }))
        .pipe(publisher.publish({
            'Cache-Control': 'max-age=300, public'
        }))
        .pipe($.awspublish.reporter());
});



gulp.task('clean', del.bind(null, ['.tmp', 'dist','uploads']));


 gulp.task('serve', ['styles', 'scripts', 'fonts', 'dev-translate',], () => {
    browserSync({
        notify: false,
        port: 9000,
        server: {
            baseDir: ['.tmp', 'app'],
            routes: {
                '/bower_components': 'bower_components'
            }
        },
        reloadDelay: 2000,
        reloadDebounce: 2000
    });

    gulp.watch([
        'app/locale/**/*',
        'app/*.html',
        'app/images/**/*',
        '.tmp/fonts/**/*',
        '.tmp/scripts/**/*.js',
    ]).on('change', reload);


    gulp.watch(['app/*.html', 'app/locale/**/*'], ['dev-translate']);
    gulp.watch('app/templates/**/*.html', ['scripts']);
    gulp.watch('app/styles/**/*.scss', ['styles']);
    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch('app/fonts/**/*', ['fonts']);
    gulp.watch('bower.json', ['wiredep', 'fonts']);
});

 //this batch of insanity tells the translator to run whenever *.html in root folder is changed.
 //it dumps translation in .tmp, then copies it out of the 'en' folder into the root of .tmp
 //then deletes the .tmp/en folder to prevent duplication. And tada translations appear on index.html and others.
 gulp.task('dev-translate', ['dev-translate-index'], () =>{
     //remove the staging tmp folder, where the translations are stored, just in case it wasn't cleaned.
     del.bind(null, ['.tmp-stage']);
     return gulp.src('.tmp/'+lang+'/**/*').pipe(gulp.dest('.tmp'))
     .on('end', function(){
         del(['.tmp/'+lang+'/**']);
     });
 });
 //ensure all of the html files are copied into .tmp.
 gulp.task('dev-copy-tmp-html', () =>{
	
     return gulp.src('app/*.html').pipe(gulp.dest('.tmp'));
 })
 //run the translation with the 'single language' option so only english is done.
 gulp.task('dev-translate-index', ['dev-copy-tmp-html', 'scripts', 'styles', 'fonts'], () => {
     return gulp.src('.tmp')
         .pipe($.staticI18n({'localeDirs': ['app/locale'], defaultLang: 'xx', singleLanguage: lang}));
 });
 
 

gulp.task('serve:dist', () => {
    browserSync({
        notify: false,
        port: 9000,
        server: {
            baseDir: ['dist']
        }
    });
});


gulp.task('serve:test', ['scripts'], () => {
    browserSync({
        notify: false,
        port: 9000,
        ui: false,
        server: {
            baseDir: 'test',
            routes: {
                '/scripts': '.tmp/scripts',
                '/bower_components': 'bower_components'
            }
        }
    });

    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch('test/spec/**/*.js').on('change', reload);
});


// inject bower components
gulp.task('wiredep', () => {
    gulp.src('app/styles/*.scss')
        .pipe(wiredep({
            ignorePath: /^(\.\.\/)+/
        }))
        .pipe(gulp.dest('app/styles'));
      
    gulp.src('app/*.html')
        .pipe(wiredep({
            exclude: ['components-font-awesome'], 
            ignorePath: /^(\.\.\/)*\.\./
        }))
        .pipe(gulp.dest('app'));
});


//matt's stuff
//____________________
// these make the po files on each compile
gulp.task('make-po', ['gettext'],  () => {
    return gulp.src("app/locale/en/**/*.po")
        .pipe($.concatPo('messages.po'))
        .pipe(gulp.dest("app/locale/en/LC_MESSAGES/"));
});
    
gulp.task("gettext", ['compile-html'],  () => {
    return gulp.src(".tmp/**/*.js")
        .pipe($.gettextParser())
        .pipe($.rename("messages.po"))
        .pipe(gulp.dest("app/locale/en/LC_MESSAGES/"))
});

//these move some things from bowered in components into the app.
gulp.task('move-jst', () => {
    return gulp.src(require('main-bower-files')('**/*.{jst,html}', function (err) {}))
        .pipe(gulp.dest('app/reuters-charter/templates_Masters'));
});

gulp.task('move-chart-block', () => {
    return gulp.src(require('main-bower-files')('**/chartBlocks/*.md', function (err) {}))
        .pipe(gulp.dest('app/reuters-charter/chartBlocks'));
});

//runs on upload-test
gulp.task('update-upload-path', () =>{
    return gulp.src('./config/aws.json')
        .pipe($.prompt.prompt({
            type: 'input',
            name: 'folder',
            message: 'current folder: '+awsConfig.graphics.folder,
            default:awsConfig.graphics.folder
        }, function(res){
            awsConfig.graphics.folder = res.folder
            require('fs').writeFileSync('./config/aws.json', JSON.stringify(awsConfig))
            //value is in res.task (the name option gives the key) 
        }));
});

//runs on default gulp.  this makes things clean for matt's server.
gulp.task('make-media', ['clean','build','build-app'], $.folders('app/locale', function(folder){
    var input = require('fs').readFileSync('app/locale/en/LC_MESSAGES/metadata.po');
    var po = require("gettext-parser").po.parse(input);
    var url = po.translations['']["page_url"].msgstr[0];

    gulp.src("app/images/share-card.png")
        .pipe($.rename("_gfxpreview.png"))
    	.pipe(gulp.dest("uploads/media-"+folder+"/media-interactive/"))

    gulp.src("dist-min/"+folder+"/**")
        .pipe(gulp.dest("uploads/media-"+folder+"/interactive"));

    gulp.src("dist-min/"+folder+"/**")
        .pipe(gulp.dest("uploads/media-"+folder+"/media-interactive/production"));

    gulp.src("dist/"+folder+"/**")
        .pipe(gulp.dest("uploads/media-"+folder+"/media-interactive/development"));

    gulp.src("media-assets/**/*.{txt,html,js}")
        .pipe($.build({
            'page_url': url.replace("http:","")
        }))
        .pipe(gulp.dest("uploads/media-"+folder+"/media-interactive"));

    return gulp.src(["./**","./.babelrc","./.bowerrc","./.gitignore","!./bower_components{,/**}","!./dist{,/**}","!./dist-min{,/**}","!./node_modules{,/**}","!./app/fonts{,/**}","!./uploads{,/**}"])
        .pipe(gulp.dest("uploads/media-"+folder+"/media-interactive/source/"));


}));

//____________________


//these are all horrible hacks to make sure certain things are the last in a sequence.
//there's probably a more gulpy way to do this, but this works for now.
gulp.task('build-app', ['images', 'compile-html',  'fonts', 'extras', 'data','localize', 'cache-breaker', 'pathing', 'uglify'], () => {
    return gulp.src(['dist/**/*', 'dist-min/**/*']).pipe($.size({title: 'build', gzip: true}));
});

gulp.task('build-app-dev', ['images', 'compile-html',  'fonts', 'extras','data', 'localize', 'cache-breaker', 'pathing',], () => {
    return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});


//this basically makes sure the upload happens at the end.
gulp.task('build-app-dev-s3', ['build-app-dev'], () => {
    gulp.start('s3-dev');
});

gulp.task('build-app-s3', ['build-app'], () => {
    gulp.start('s3-dist');
});

gulp.task('build-app-dev-s3-graphics', ['build-app-dev'], () => {
    gulp.start('s3-graphics');
});


//The below commands are the ones people should actually run.
//builds everything.
gulp.task('build', ['clean'], () => {
    return gulp.start('build-app');
});

//builds a compiled but unminified version of everything.
gulp.task('build-dev', ['clean'], () => {
    gulp.start('build-app-dev');
});


//builds the unminified dev stuff and kicks to S3.
gulp.task("build-dev-s3", ['clean'], () =>{
    gulp.start("build-app-dev-s3");
});

//builds the minified stuff and kicks to S3 live.
gulp.task("build-dist-s3", ['clean'], () =>{
    gulp.start("build-app-s3");
});

//builds the unminified dev stuff and uploads to graphics.reuters.com
gulp.task("upload-test", ['clean','update-upload-path'], () =>{
    gulp.start("build-app-dev-s3-graphics");
});

gulp.task('default', ['build'], () =>{
    gulp.start("make-media");
});