var Metalsmith = require('metalsmith'),
    branch = require('metalsmith-branch'),
  	markdown   = require('metalsmith-markdown'),
    templates  = require('metalsmith-templates')
    Handlebars = require('handlebars'),
    collections = require('metalsmith-collections'),
    permalinks  = require('metalsmith-permalinks'),
    tags = require('metalsmith-tags'),
    multimatch = require('multimatch'),
    inplace = require('metalsmith-in-place'),
    layouts = require('metalsmith-layouts'),
	fs         = require('fs'),
	Handlebars = require('handlebars'),
	Swag = require('swag');

Swag.registerHelpers(Handlebars);

var findLayout = function(config) {
    var pattern = new RegExp(config.pattern);

    return function(files, metalsmith, done) {
        for (var file in files) {
            if (pattern.test(file)) {
                var _f = files[file];
                if (!_f.layout) {
                    _f.layout = config.layoutName;
                }
            }
        }
        done();
    };
};

var metaUrl = function(config) {
	var pattern = config.pattern;

    return function(files, metalsmith, done) {
        Object.keys(files).forEach(function (filepath) {
        // parent folder name
        	// if (pattern.test(files[filepath])) {
        		console.log(filepath);
	        	files[filepath]['url'] = filepath.replace("index.md","");
        	// }
    	});
        done();
    };
};

Handlebars.registerHelper("debug", function(optionalValue) {
  console.log("Current Context");
  console.log("====================");
  console.log(this);
 
  if (optionalValue) {
    console.log("Value");
    console.log("====================");
    console.log(optionalValue);
  }
});

var sitebuild = Metalsmith(__dirname)
	.metadata({
	    site: {
	      title: 'Zebra Developer Community',
	      url: 'http://127.0.0.1:8080/'
	    }
	  })
	.use(metaUrl({
		pattern: '*.md'
	}))
	.use(inplace({
	  engine: 'handlebars',
	  partials: 'partials',
	  pattern: '**/*.md'
	}))	
	.use(collections({
	    pages: {
	        pattern: 'pages/**/*.md'
	    },
	    blogs: {
	        pattern: 'blogs/**/*.md',
	        sortBy: 'date',
	        reverse: true
	    },
	    videos: {
	        pattern: 'videos/**/*.md',
	        sortBy: 'date',
	        reverse: true
	    }

	}))
	.use(branch('blogs/**/*.md')
		.use(tags({
		    handle: 'tags',
		    path:'blogs/category/:tag/index.html',
		    layout: __dirname + '/layouts/list-category.html',
		    sortBy: 'date',
		    reverse: true,
		    skipMetadata: false,
		    slug: {mode: 'rfc3986'}
		  }))
	)
	.use(branch('videos/**/*.md')
		.use(tags({
		    handle: 'tags',
		    path:'videos/category/:tag/index.html',
		    layout: __dirname + '/layouts/list-category.html',
		    sortBy: 'date',
		    reverse: true,
		    skipMetadata: false,
		    slug: {mode: 'rfc3986'}
		  }))
	)
    .use(findLayout({
        pattern: 'blogs',
        layoutName: 'page.html'
    }))
    .use(markdown({
	  smartypants: true,
	  gfm: true,
	  tables: true
	}))

	// .use(permalinks())
    // .use(templates('handlebars'))
	.use(layouts({
	  directory: 'layouts',
	  default: 'index.html',
	  engine: 'handlebars',
	  // partials: 'partials',
	  pattern: '**/*.html'
	}))
    .destination('./build')
    .build(function (err) {
    if (err) {
      console.log(err);
    }
    else {
      console.log('Site build complete!');
    }
  });