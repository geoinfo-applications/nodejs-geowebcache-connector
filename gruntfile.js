"use strict";

const fs = require("fs");
const _ = require("underscore");

module.exports = function (grunt) {

    const jsFiles = [
        "gruntfile.js",
        "server.js",
        "server/**/*.js"
    ];


    grunt.initConfig({

        clean: {
            server: (function () {
                const packageJson = require("./package.json");

                return _.pairs(_.extend({}, packageJson.dependencies, packageJson.devDependencies))
                    .filter((dep) => /git.geoinfo.ch/.test(dep[1]))
                    .map((dep) => "./node_modules/" + dep[0])
                    .filter((path) => fs.existsSync(path))
                    .filter((path) => !fs.lstatSync(path).isSymbolicLink());
            }())
        },

        david: {
            check: {
                options: {
                    warn404: true
                }
            }
        },

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
                    exclude: /^(node_modules|coverage|reports|client\/vendor|client\/updatetool\/(js|scripts|dist|help))\//
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
                commitMessage: "[grunt release plugin] release <%= version %>",
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
    grunt.registerTask("update", ["clean", "exec:install", "david"]);
    grunt.registerTask("test", ["eslint", "mochaTest"]);
    grunt.registerTask("build", ["code-check", "update", "env:build", "mocha_istanbul:bambooCoverage", "plato"]);
};
