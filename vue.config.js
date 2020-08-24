var webpack = require('webpack');
var MangleJsClassPlugin = require('mangle-js-webpack-plugin');
var ZipPlugin = require('./src/zip.js');

module.exports = {
    filenameHashing: false,
    productionSourceMap: false,
    lintOnSave: false,
    pages: {
        content: {
            entry: 'src/content.ts',
            filename: 'content.html'
        },
        background: {
            entry: 'src/background.ts',
            filename: 'background.html'
        },
        popup: {
            entry: 'src/popup.ts',
            filename: 'popup.html'
        },
        login: {
            entry: 'src/login.ts',
            filename: 'login.html'
        },
        settings: {
            entry: 'src/settings.ts',
            filename: 'settings.html'
        },
        worksheet: {
            entry: 'src/worksheet.ts',
            filename: 'worksheet.html'
        },
        register: {
            entry: 'src/register.ts',
            filename: 'register.html'
        },
        forget: {
            entry: 'src/forget.ts',
            filename: 'forget.html'
        }
    },
    css: {
        extract: true,
        sourceMap: false,
        loaderOptions: {},
        modules: false
    },
    configureWebpack: {
        optimization: {
            //splitChunks: {
            //    chunks: 'all',
            //    //minSize: 30000,
            //    minChunks: 10,
            //    //maxAsyncRequests: 5,
            //    //maxInitialRequests: 3,
            //    //automaticNameDelimiter: '~',
            //    //name: true,
            //    //cacheGroups: {
            //    //    jquery: {
            //    //        name: `chunk-jquery`,
            //    //        test: /[\\/]node_modules[\\/].*?jquery.*?/,
            //    //        priority: -5,
            //    //        chunks: 'initial'
            //    //    },
            //    //    vendors: {
            //    //        name: `chunk-vendors`,
            //    //        test: /[\\/]node_modules[\\/]/,
            //    //        priority: -10,
            //    //        chunks: 'initial'
            //    //    },
            //    //    utils: {
            //    //        name: `chunk-utils`,
            //    //        test: /.*src[\\/]core[\\/]message.*/,
            //    //        priority: -15,
            //    //        chunks: 'initial'
            //    //    },
            //    //    common: {
            //    //        name: `chunk-common`,
            //    //        priority: -20,
            //    //        chunks: 'initial',
            //    //        reuseExistingChunk: false
            //    //    }
            //    //}
            //}
            splitChunks: false
        },
        plugins: [
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery"
            })
            //, new MangleJsClassPlugin({ //调试注释该部分
            //    exclude: /chunk-vendors.*/,
            //    algorithm: 'obfuscator' // 'obfuscator' || 'jjencode' || 'aaencode'
            //})
            //,new ZipPlugin({
            //    chrome: ["applications"]
            //})
            //new BundleAnalyzerPlugin()
        ]
    }
    ,chainWebpack(webpackConfig) { //调试打开该部分
        webpackConfig.optimization.minimize(false);
    }
};