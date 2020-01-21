"use strict";

const fs = require("fs");

module.exports = function (grunt) {

    const jsFiles = [
        "gruntfile.js",
        "server.js",
        "server/**/*.js"
    ];

    grunt.initConfig({

        env: {
            build: {
                multi: "spec=- mocha-bamboo-reporter=-"
            }
        },

        exec: {
            install: {
                command: "npm ci"
            }
        },

        eslint: {
            options: {
                fix: grunt.option("fix")
            },
            src: jsFiles
        },

        mochaTest: {
            unit: {
                options: {
                    reporter: "spec",
                    require: "./server/test/test-server.js"
                },
                src: ["./server/test/**/*.js"]
            }
        },

        mocha_istanbul: {
            bambooCoverage: {
                src: "./server/test/**",
                options: {
                    reporter: "mocha-multi",
                    reportFormats: ["lcov", "clover"],
                    recursive: true,
                    coverageFolder: "./coverage/server"
                }
            },
            coverage: {
                src: "./server/test/**",
                options: {
                    recursive: true,
                    coverageFolder: "./coverage/server"
                }
            }
        },

        plato: {
            reports: {
                options: {
                    jshint: false,
                    exclude: /^(node_modules|coverage|reports)\//
                },
                files: {
                    reports: ["**/*.js"]
                }
            }
        },

        release: {
            options: {
                npm: true,
                tagName: "release-<%= version %>",
                commitMessage: "[grunt release plugin] release-<%= version %>",
                tagMessage: "[grunt release plugin] version <%= version %>"
            }
        },

        todo: {
            src: jsFiles
        }
    });

    const files = fs.readdirSync("node_modules/");
    require("load-grunt-tasks")(grunt, { config: { dependencies: files } });

    grunt.registerTask("code-check", ["eslint", "todo"]);
    grunt.registerTask("test", ["eslint", "mochaTest"]);
    grunt.registerTask("build", ["code-check", "env:build", "mocha_istanbul:bambooCoverage"]);
};
