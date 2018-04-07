grunt.initConfig({
    angularCombine : {
        combine : {
            options : {
                processIdentifier : function(id) {
                    // just use the files name without extension as identifier
                    return id.split('/').pop().replace('.html', '');
                }
            },
            files : [ {
                expand : true,
                cwd : 'app/modules',
                src : '*',
                dest : 'tmp/combined',
                filter : 'isDirectory'
            } ]
        }
    }
})