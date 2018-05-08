/**
 * 分享模块
 * Created by 王佳欣 on 2018/4/15.
 */
import {loadJs} from '../utils';
import Is from '../utils/is';
import {formatShareUrl} from '../utils/uri';

class ThirdPlat {
    constructor ({tokenUrl, tokenType = 'json', jsSdk = '//res.wx.qq.com/open/js/jweixin-1.2.0.js',
        qqapi = '//open.mobile.qq.com/sdk/qqapi.js?_bid=152'}) {
        this.tokenUrl = tokenUrl;
        this.jsSdk = jsSdk;
        this.qqapi = qqapi;
        this.tokenType = tokenType;
        this.shareConfig = {
            link: '',
            title: '',
            desc: '',
            imgUrl: ''
        };
        this.trigger = null;
        this.success = null;
        this.fail = null;
        this.cancel = null;
    }

    setShare (option, trigger, success, fail, cancel) {
        this.shareConfig = option;

        let {link, title, desc, imgUrl} = option || {
            link: '',
            title: '',
            desc: '',
            imgUrl: ''
        };

        if (Is.isMeituApp()) {
            this._initMeitu(option);
            return false;
        }

        if (Is.isQQ()) {
            this._initQQ(option);
            return false;
        }

        if (!Is.isWechat() && !Is.isQZone()) {
            return false;
        }

        const PLATS = ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone'];

        /* eslint-disable */
        wx.error(function (error) {
            console.log(error);
        });
        wx.ready(function () {
            PLATS.map((plat) => {
                wx[plat]({
                    title,
                    desc,
                    link: formatShareUrl(link),
                    imgUrl,
                    trigger: function (e) {
                        trigger && trigger();
                    },
                    success: function (e) {
                        success && success();
                    },
                    fail: function () {
                        fail && fail();
                    },
                    cancel: function () {
                        cancel && cancel();
                    }
                });
            });
        });
    }

    callShare () {
        if (Is.isMeituApp()) {
            window.MTJs.callSharePageInfo();
            return false;
        }
        if (Is.isWeibo() || Is.isQZone() || Is.isWechat() || Is.isWeibo()) {
            $('body').append(`<div class="globalShare globalShare——social"></div>`);
            return false;
        }

        $('body').append(`<div class="globalShare globalShare——browser"></div><div class="globalShare-content">
                <div class="globalShare-title"># 分享到 #</div>
                <div class="globalShare-list">
                    <a 
                        class="globalShare-item" 
                        target="_share" 
                        href="${encodeURI(`http://v.t.sina.com.cn/share/share.php?url=${this.shareConfig.link}&title=${this.shareConfig.title}&description=${this.shareConfig.desc}&charset=utf-8&pic=${this.shareConfig.imageUrl}`)}&searchPic=true" 
                        class="globalShare-item globalShare-item">
                        <span class="globalShare-icon globalShare-icon——weibo"></span>
                        <span class="globalShare-name">微博</span>
                    </a>
                    <a 
                        class="globalShare-item" 
                        target="_share" 
                        href="${encodeURI(`http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${this.shareConfig.link}&title=${this.shareConfig.title}&desc=${this.shareConfig.desc}&charset=utf-8&pics=${this.shareConfig.imageUrl}&site=${this.shareConfig.link}&otype=share`)}" 
                        class="globalShare-item globalShare-item">
                        <span class="globalShare-icon globalShare-icon——qqzone"></span>
                        <span class="globalShare-name">QQ空间</span>
                    </a>
                    <a 
                        class="globalShare-item" 
                        target="_share" 
                        href="${encodeURI(`http://widget.renren.com/dialog/share?resourceUrl=${this.shareConfig.link}&title=${this.shareConfig.title}&description=${this.shareConfig.desc}&charset=utf-8&pic=${this.shareConfig.imageUrl}`)}" 
                        class="globalShare-item globalShare-item">
                        <span class="globalShare-icon globalShare-icon——renren"></span>
                        <span class="globalShare-name">人人网</span>
                    </a>
                </div>
                <a href="javascript:;" class="globalShare-cancel">取消</a>
            </div>`);
    }

    previewImage (urls, currentIndex) {
        wx.previewImage({
            urls,
            current: urls[currentIndex]
        });
    }

    downLoadImage () {

    }

    closeWindow () {
        wx.closeWindow();
    }

    chooseWXPay ({timestamp, nonceStr, packageStr, signType, paySign}) {
        wx.chooseWXPay({
            timestamp,
            nonceStr,
            package: packageStr,
            signType,
            paySign
        });
    }

    config ({appId, timestamp, nonceStr, signature}) {
        /* eslint-disable */
        wx.config({
            debug: false,
            appId,
            timestamp,
            nonceStr,
            signature,
            jsApiList: [
                'onMenuShareTimeline',
                'onMenuShareAppMessage',
                'onMenuShareQQ',
                'onMenuShareWeibo',
                'onMenuShareQZone',
                'closeWindow',
                'getLocation',
                'openLocation',
                'getLocation',
                'chooseImage',
                'previewImage',
                'downloadImage',
            ]
        });
    }

    bindEvent () {
        $('body').on('click', '.globalShare, .globalShare-cancel', () => {
            $('.globalShare').addClass('out').on('animationend webkitAnimationEnd oAnimationEnd', function () {
                $(this).remove();
            });
            $('.globalShare-content').addClass('out').on('animationend webkitAnimationEnd oAnimationEnd', function () {
                $(this).remove();
            });

            this.cancel && this.cancel();
        });

        $('body').on('click', '.globalShare-item', () => {
            $('.globalShare').remove();
            $('.globalShare-content').remove();
            this.success && this.success();
        });
    }
    _initMeitu(option, trigger, success, fail, cancel) {
        window.addEventListener('WebviewJsBridgeReady', function() {
            window.MTJs.onSharePageInfo({
                title: option.title || '', // 选填
                image: option.imgUrl || '', // 选填 [img_url 兼容美拍旧代码]
                description: option.desc || '', // 选填 [content 兼容美拍旧代码] (android下的分享是没法将description分享出去，所以可以该值可同title)
                link: option.link || '', // 选填 [url 兼容美拍旧代码]
                success: function () {
                    success && success();
                }
            });
        }, false);
    }
    _initQQ (data, trigger, success, fail, cancel) {
        var info = {title: data.title, desc: data.desc, share_url: data.link, image_url: data.imgUrl};

        function doQQShare() {
            try {
                if (data.callback) {
                    window.mqq.ui.setOnShareHandler(function(type) {
                        info.share_type = type;
                        info.back = true;
                        window.mqq.ui.shareMessage(info, function(result) {
                            if (result.retCode === 0) {
                                data.callback && data.callback.call(this, result);
                            }
                        });
                    });
                } else {
                    window.mqq.data.setShareInfo(info);
                }
            } catch (e) {
            }
        }
        if (window.mqq) {
            doQQShare();
        } else {
            loadJs (this.qqapi).then(() => {
                doQQShare();
            });
        }
    }
   _initWechat (config) {
        loadJs (this.jsSdk).then(() => {
            window.wx = wx;
            return $.ajax({
                url: this.tokenUrl,
                dataType: this.tokenType,
                type: 'get',
                data: {
                    url: location.href.split('#')[0],
                    t: new Date().getTime()
                },
                responseType: 'json',
                async: true,
                xhrFields: {withCredentials: true},
            }).then(response => {
                let {appId, timestamp, nonceStr, signature} = response;
                this.config({appId, timestamp, nonceStr, signature});
                this.setShare(config);
            });
        });
    }
    init (config) {
        this.bindEvent();
        Is.isWechat() && this._initWechat(config);
        Is.isMeituApp() && this._initMeitu(config);
        Is.isQQ() && this._initQQ(config);
    }
}

// install
function install (App, config) {
    if (install.installed) {
        return false;
    }

    install.installed = true;

    let thirdPlat = new ThirdPlat(config);


    Object.defineProperty(App.prototype, '$thirdPlat', {
        get () {
            return thirdPlat;
        }
    });

    Object.defineProperty(App.prototype, '_thirdPlat', {
        get () {
            return thirdPlat;
        }
    });
}

ThirdPlat.install = install;

export default  ThirdPlat;
