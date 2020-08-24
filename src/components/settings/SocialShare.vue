<template>
    <ul class="social">
        <li v-for="key in keys"><a target="_blank" :href="getLink(key)"><i :class="getClass(key)"></i></a></li>
    </ul>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';

    @Component
    export default class SocialShare extends Vue {
        shares: any;
        keys: string[] = [];
        uParam: any = {};

        getClass(key: string) {
            return "fa fa-" + key;
        }

        getLink(key: string) {
            var url = this.shares[key];

            Object.keys(this.uParam).forEach(key => {
                url = url.replace(new RegExp("@" + key, "g"), this.uParam[key]);
            });

            return url;
        }

        created() {
            var _this = this;
            this.shares = {
                "facebook": "https://www.facebook.com/sharer/sharer.php?u=@url&title=@title&description=@description&quote=@quote",
                "google-plus": "https://plus.google.com/share?url=@url",
                //"line": "http://line.me/R/msg/text/?@description%0D%0A@url",
                "linkedin": "https://www.linkedin.com/shareArticle?mini=true&url=@url&title=@title&summary=@description",
                "odnoklassniki": "https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl=@url&st.comments=@description",
                "pinterest": "https://pinterest.com/pin/create/button/?url=@url&media=@media&description=@title",
                "reddit": "https://www.reddit.com/submit?url=@url&title=@title",
                "skype": "https://web.skype.com/share?url=@description%0D%0A@url",
                "telegram": "https://t.me/share/url?url=@url&text=@description",
                "twitter": "https://twitter.com/intent/tweet?text=@title&url=@url&hashtags=@hashtags@twitteruser",
                "vk": "https://vk.com/share.php?url=@url&title=@title&description=@description&image=@media&noparse=true",
                "weibo": "http://service.weibo.com/share/share.php?url=@url&title=@title",
                "qq": "http://connect.qq.com/widget/shareqq/index.html?url=@url&title=@title&source=source&desc=@description&pics=",
                "wechat":"wechat"
            };

            this.keys = Object.keys(this.shares);

            var code = (this.$parent as any).stat.code;

            this.uParam = {
                url: "http://www.ruijihg.com/",
                title: "分享一款提取网页数据的浏览器插件 RuiJi Scraper,我的推广码:" + code,
                description: "分享一款提取网页数据的浏览器插件 RuiJi Scraper,我的推广码:" + code,
                media: "http://www.ruijihg.com/",
                hashtags: "scraper crawler extractor ruiji.net",
                twitteruser: "zhupingqi"
            };
        }
    }
</script>

<style>
    ul.social {
        height: 40px;
        margin: 0;
    }

        ul.social li {
            float: left;
            width: 32px;
            height: 32px;
            list-style-type: none;
            margin: 5px;
            line-height: 32px;
            text-align: center;
        }

        ul.social i {
            margin: 0;
            padding-top: 6px;
            border: 1px solid;
            border-radius: 50%;
            width: 32px;
            height: 32px;
        }

            ul.social i.fa-weibo {
                color: #ff763b;
                border-color: #ff763b;
            }

            ul.social i.fa-qq {
                color: #56b6e7;
                border-color: #56b6e7;
            }

            ul.social i.fa-google-plus {
                color: #db4437;
                border-color: #db4437;
            }

            ul.social i.fa-twitter {
                color: #55acee;
                border-color: #55acee;
            }

            ul.social i.fa-facebook {
                color: #44619D;
                border-color: #44619D;
            }

            ul.social i.fa-linkedin {
                color: #0077B5;
                border-color: #0077B5;
            }

            ul.social i.fa-google-plus {
                color: #db4437;
                border-color: #db4437;
            }
</style>