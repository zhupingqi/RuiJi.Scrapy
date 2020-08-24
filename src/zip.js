const fs = require('fs');
const path = require('path');
var chalk = require('chalk');
var JSZip = require("jszip");

function ZipPlugin(pluginOptions) {
    this.options = pluginOptions;
}

ZipPlugin.prototype.apply = function (compiler) {
    const _this = this;
    
    compiler.plugin('after-emit', function (compilation, callback) {
        var filePath = path.resolve(__dirname);

        console.log(filePath);

        //filterFile(filePath);

        //function filterFile(fp) {
        //    fs.readdir(fp, (err, files) => {
        //        files.forEach((filename) => {
        //            if (_this.options.jsReg.test(filename)) {
        //                var filedir = path.resolve(fp, filename);
        //                fs.readFile(filedir, 'utf-8', (err, data) => {
        //                    if (err) {
        //                        console.log(chalk.yellow(
        //                            '读取js文件异常：\n' +
        //                            err.message + '\n'
        //                        ))
        //                        return;
        //                    }

        //                    let result = jjencode(_this.options.global, data);
        //                    fs.writeFile(filedir, result, (err) => {
        //                        if (err) {
        //                            console.log(chalk.yellow(
        //                                '写入加密后的js文件异常：\n' +
        //                                err.message + '\n'
        //                            ))
        //                            return;
        //                        }
        //                        console.log(chalk.cyan('  jsencode complete.\n'))
        //                    })
        //                })
        //            }
        //        })
        //    })
        //}

        callback();
    });
};

module.exports = ZipPlugin;