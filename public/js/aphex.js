+function ($) {

    class AphT {
        constructor(options) {
            this.processes = {};

            this.imageRegex = /https:\/\/media\d?(-integration)?.ntslive.co.uk\/resize\/\d+x\d+\/.*\.(jpeg|png|jpg)/;

            this.$aphexFaceFlash = $('#afx-container');

            this.optionTypes = {
                'OVERLAY': 'OVERLAY',
                'FACE_REPLACER': 'FACE_REPLACER',
                'FONTS': 'FONTS',
            };

            this.setOptions(options)
        }

        setOptions(options) {
            options = options || {};
            let faceReplacer = options.faceReplacer || {};
            this.faceReplacerOptions = {};
            this.faceReplacerOptions.afxMaxDelay = (faceReplacer.afxMaxDelay || 0.5) * 1000;
            this.faceReplacerOptions.afxMinDelay = Math.max(faceReplacer.afxMinDelay || 0.1, 0.1) * 1000;
            this.faceReplacerOptions.origMaxDelay = (faceReplacer.origMaxDelay || 5) * 1000;
            this.faceReplacerOptions.origMinDelay = Math.max(faceReplacer.origMinDelay || 2, 0.1) * 1000;
            this.faceReplacerOptions.afxSwitch = this._shouldSwitchOn(faceReplacer.prob || -1) || (NTS.getSearchParams().aphex == 'true');

            this.overlayOptions = {};
            let overlayOptions = options.overlay || {};
            this.overlayOptions.afxMaxDelay = (overlayOptions.afxMaxDelay || 0.5) * 1000;
            this.overlayOptions.afxMinDelay = Math.max(overlayOptions.afxMinDelay || 0.1, 0.1) * 1000;
            this.overlayOptions.origMaxDelay = (overlayOptions.origMaxDelay || 5) * 1000;
            this.overlayOptions.origMinDelay = Math.max(overlayOptions.origMinDelay || 2, 0.1) * 1000;
            this.overlayOptions.afxSwitch = this._shouldSwitchOn(overlayOptions.prob || -1) || (NTS.getSearchParams().aphex == 'true');

            this.fontOptions = {};
            let fontOptions = options.font || {};
            this.fontOptions.afxMaxDelay = (fontOptions.afxMaxDelay || 7) * 1000;
            this.fontOptions.afxMinDelay = Math.max(fontOptions.afxMinDelay || 1, 1) * 1000;
            this.fontOptions.origMaxDelay = (fontOptions.origMaxDelay || 10) * 1000;
            this.fontOptions.origMinDelay = Math.max(fontOptions.origMinDelay || 2, 2) * 1000;
            this.fontOptions.afxSwitch = this._shouldSwitchOn(fontOptions.prob || -1) || (NTS.getSearchParams().aphex == 'true');
        }

        clearProcesses() {
            this.processes = {};
        }

        enableProcess(key) {
            this.processes[key] = true;
        }

        isEnabledProcess(key) {
            return !!this.processes[key]
        }

        _shouldSwitchOn(aphexProbability) {
            return Math.random() <= aphexProbability;
        }

        _swapGridImages(processKey) {
            let that = this;
            let $imgs = $('.nts-grid-item__img img');

            if ($imgs.length === 0) {
                $imgs = $('.residents-grid .img-wrapper img');
            }

            if ($imgs.length === 0) {
                return;
            }

            let imgIndex = $imgs.length-1;
            function getNextImage() {
                let $img = $($imgs[imgIndex]);

                let originalImageUrl = $img.attr('src');

                that._preloadAphexImage(originalImageUrl).then( function(response) {
                    if (!!response) {
                        that._swapImageSrc($img,
                            response.aphexUrl,
                            originalImageUrl,
                            true,
                            processKey
                        )
                    }

                    imgIndex--;
                    if (imgIndex >= 0) {
                        getNextImage();
                    }
                });
            }

            getNextImage();
        }

        _generateRandomTimeout(is_aphex, type) {
            let afxMaxDelay, afxMinDelay, origMaxDelay, origMinDelay;

            if (this.optionTypes[type] === this.optionTypes.FACE_REPLACER) {
                afxMaxDelay = this.faceReplacerOptions.afxMaxDelay;
                afxMinDelay = this.faceReplacerOptions.afxMinDelay;
                origMaxDelay = this.faceReplacerOptions.origMaxDelay;
                origMinDelay = this.faceReplacerOptions.origMinDelay;
            } else if (this.optionTypes[type] === this.optionTypes.OVERLAY) {
                afxMaxDelay = this.overlayOptions.afxMaxDelay;
                afxMinDelay = this.overlayOptions.afxMinDelay;
                origMaxDelay = this.overlayOptions.origMaxDelay;
                origMinDelay = this.overlayOptions.origMinDelay;
            } else if (this.optionTypes[type] === this.optionTypes.FONTS) {
                afxMaxDelay = this.fontOptions.afxMaxDelay;
                afxMinDelay = this.fontOptions.afxMinDelay;
                origMaxDelay = this.fontOptions.origMaxDelay;
                origMinDelay = this.fontOptions.origMinDelay;
            } else {
                return (is_aphex) ? 100: 10000;
            }

            if (is_aphex) {
                return (afxMaxDelay * Math.random()) + afxMinDelay;
            }
            return (origMaxDelay * Math.random()) + origMinDelay;
        }

        _swapImageSrc($img, newImageSrc, existingImageSrc, is_aphex, processKey) {
            if (!this.isEnabledProcess(processKey)) { return; }
            let that = this;

            $img.attr("src", newImageSrc);

            setTimeout(function() {
                that._swapImageSrc($img, existingImageSrc, newImageSrc, !is_aphex, processKey);
            }, this._generateRandomTimeout(is_aphex, this.optionTypes.FACE_REPLACER));
        }

        _swapBackgroundImage($img, newBackgroundImageProp, existingBackgroundImageProp, is_aphex, processKey) {
            if (!this.isEnabledProcess(processKey)) { return; }

            let that = this;
            $img.css(
                'background-image',
                newBackgroundImageProp
            );

            setTimeout(function() {
                that._swapBackgroundImage($img, existingBackgroundImageProp, newBackgroundImageProp, !is_aphex, processKey);
            }, this._generateRandomTimeout(is_aphex));
        }

        _preloadAphexImage(imageUrl) {
            return new Promise( (resolve, reject) => {
                // console.log("Loading");
                if (!imageUrl) {
                    console.log("No image url given.");
                    return resolve();
                }

                let aphexedImageUrl = imageUrl.replace('resize', 'afx').replace(/\/media\d?/, 'media');

                let preloadedImage = new Image();
                preloadedImage.onload = function() {
                    // console.log("Loaded");
                    resolve({
                        aphexUrl: aphexedImageUrl,
                        originalUrl: imageUrl,
                    });
                };
                preloadedImage.src = aphexedImageUrl;
            });
        }

        _swapHomepageImages(processKey) {
            let that = this;
            let $imgs = $('#carousel .slides .slide--mobile .img');

            if ($imgs.length === 0) {
                return;
            }

            let imgIndex = 0;
            function getNextImage() {
                let $img = $($imgs[imgIndex]);

                let matchedImageResult = $img.css('background-image').match(that.imageRegex);
                let originalImageUrl = matchedImageResult && matchedImageResult[0];

                that._preloadAphexImage(originalImageUrl).then( function(response) {
                    if (!!response) {
                        that._swapBackgroundImage($img,
                            `url(${response.aphexUrl})`,
                            `url(${response.originalUrl})`,
                            true,
                            processKey
                        );
                    }

                    imgIndex++;
                    if (imgIndex < $imgs.length) {
                        getNextImage();
                    }
                });
            }

            getNextImage();
        }

        _swapEpisodeImage(processKey) {
            let that = this;
            let $background = $('#bg');

            if ($background.length === 0) {
                return;
            }

            let backgroundImageResult = $background.css('background-image').match(this.imageRegex);
            let originalImageUrl = backgroundImageResult && backgroundImageResult[0];

            that._preloadAphexImage(originalImageUrl).then( function(response) {
                if (!!response) {
                    that._swapBackgroundImage($background,
                        `url(${response.aphexUrl})`,
                        `url(${response.originalUrl})`,
                        true,
                        processKey
                    );
                }
            });
        }

        swapImages() {
            if (!this.faceReplacerOptions.afxSwitch) return;

            let processKey = + new Date();
            this.enableProcess(processKey);

            if ((!NTS.state.isMobile() || !$("#home-ntspicks").length) && !$("#profile-container").length) {
                this._swapGridImages(processKey);
            }

            if (NTS.state.isMobile()) {
                this._swapHomepageImages(processKey);
            }
        }

        flashFace() {
            if ( ($("#home").length === 0) || !this.overlayOptions.afxSwitch || NTS.state.isMobile()) return;

            let that = this;
            let processKey = "HomepageOverlay";
            this.enableProcess(processKey);

            function loopFlashFace(aphexIsVisible) {
                if (!that.isEnabledProcess(processKey)) return;

                if (aphexIsVisible) {
                    that.$aphexFaceFlash.addClass('hidden');
                } else {
                    that.$aphexFaceFlash.removeClass('hidden');
                }

                setTimeout(() => {
                    loopFlashFace(!aphexIsVisible);
                }, that._generateRandomTimeout(!aphexIsVisible, that.optionTypes.OVERLAY));
            }

            loopFlashFace(false);
        }

        swapFonts() {
            let that = this;

            let elementClassifiers = [
                '.bio__title h1',
                '.nts-grid-item__title',
            ];

            function swapFontLoop($el, changeToAphex, processKey) {
                if (!that.isEnabledProcess(processKey)) { return; }

                if (changeToAphex) {
                    $el.addClass('aphex-font');
                } else {
                    $el.removeClass('aphex-font');
                }

                setTimeout(function() {
                    swapFontLoop($el, !changeToAphex, processKey)
                }, that._generateRandomTimeout(changeToAphex, that.optionTypes.FONTS));
            }

            let processKey = + new Date();
            that.enableProcess(processKey);
            for (let i=0; i < elementClassifiers.length; i++) {
                let $elements = $(elementClassifiers[i]);

                $elements.each(function(elementIndex) {
                    setTimeout(function() {
                        swapFontLoop($($elements[elementIndex]), true, processKey);
                    }, that._generateRandomTimeout(false, that.optionTypes.FONTS))
                })
            }
        }
    }

    $(document).on('ready ntsAjaxLoaded', function() {
        if (typeof Promise == "undefined" || Promise.toString().indexOf("[native code]") == -1) { return; }

        if (!firebase.apps.length) {
            let config = {
                apiKey: "AIzaSyCn2JexWTvW3fyvyvjWNcdwe-wDkgOw1c0",
                authDomain: "nts-afx.firebaseapp.com",
                databaseURL: "https://nts-afx.firebaseio.com",
                projectId: "nts-afx",
                storageBucket: "nts-afx.appspot.com",
                messagingSenderId: "1740064170",
            };
            firebase.initializeApp(config);
        }

        firebase.database().ref('options').once('value', function(snapshot) {
            if (!window.aph) {
                window.aph = new AphT(snapshot.val());
            } else {
                window.aph.setOptions(snapshot.val());
                window.aph.clearProcesses();
            }

            setTimeout(function() {
                window.aph.swapImages();
                window.aph.swapFonts();
            }, 500);
            setTimeout(window.aph.flashFace.bind(window.aph), 4000);
        });

    });
}(jQuery, NTS);
