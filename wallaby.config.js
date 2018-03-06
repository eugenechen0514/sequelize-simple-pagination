module.exports = function (wallaby) {
    return {
        files: [
            'lib/**/*.js'
        ],

        tests: [
            '__tests__/**/*.js'
        ],

        env: {
            type: 'node',
            runner: 'node'
        },

        testFramework: 'jest',

        debug: true
    };
};