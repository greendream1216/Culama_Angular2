/// <reference path="../../../../Scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../../../Scripts/typings/angularjs/angular-route.d.ts" />
var culamaApp;
(function (culamaApp) {
    var areas;
    (function (areas) {
        var companyWall;
        (function (companyWall) {
            var controllers;
            (function (controllers) {
                var CompanyWallPostController = (function () {
                    function CompanyWallPostController(scope, $rootScope, $sce, $filter, companyWallPostService) {
                        this.scope = scope;
                        this.$rootScope = $rootScope;
                        this.$sce = $sce;
                        this.$filter = $filter;
                        this.companyWallPostService = companyWallPostService;
                        this.wallpost = new culamaApp.areas.companyWall.models.WallPost();
                        var currObj = this;
                        var currUrl;
                        this.scope.isWallPosts = false;
                        this.scope.isEditMode = false;
                        debugger;
                        //this.scope.wallID = this.getParameterByName("wid");
                        this.scope.wallID = this.getParameterByName();
                        debugger;
                        if (this.scope.isEditMode == false)
                            this.getWallPosts(this.scope.wallID);
                        else
                            this.getWallPostDetailsByWallPostId(this.scope.wallID);
                        var $formValidate = $('#wallPostForm');
                        if ($formValidate.length != 0) {
                            $formValidate.parsley()
                                .on('form:validated', function () {
                                scope.$apply();
                            })
                                .on('field:validated', function (parsleyField) {
                                if ($(parsleyField.$element).hasClass('md-input')) {
                                    scope.$apply();
                                }
                            });
                        }
                        this.scope.saveWallPostInfo = function () {
                            currObj.createWallPost();
                        };
                        this.scope.deleteWallPost = function (wallpostId) {
                            UIkit.modal.confirm('Are you sure want to delete?', function () {
                                currObj.deleteWallPost(wallpostId);
                            });
                        };
                        this.scope.abccc = function () {
                            debugger;
                            alert("hi...");
                        };
                    }
                    CompanyWallPostController.prototype.getWallPosts = function (wallId) {
                        var _this = this;
                        this.$rootScope.$emit("toggleLoader", true);
                        var ft = this.$filter;
                        this.companyWallPostService.getCompanyWallPostsByWallId(wallId).then(function (result) {
                            if (result.data.length > 0) {
                                $.each(result.data, function () {
                                    if (typeof this.CreatedOn === 'string') {
                                        var activationon = new Date(parseInt(this.CreatedOn.substr(6)));
                                        this.CreatedOn = ft('date')(activationon, "dd MMM yyyy");
                                    }
                                });
                                _this.scope.isWallPosts = true;
                                _this.scope.wallPosts = result.data;
                            }
                        });
                        this.$rootScope.$emit("toggleLoader", false);
                    };
                    CompanyWallPostController.prototype.getWallPostDetailsByWallPostId = function (wallPostId) {
                        var _this = this;
                        this.$rootScope.$emit("toggleLoader", true);
                        var ft = this.$filter;
                        this.companyWallPostService.getCompanyWallPostInfoByPostId(wallPostId).then(function (result) {
                            debugger;
                            if (result.data != null) {
                                _this.wallpost = result.data;
                                if (result.data.WallPostMediaInfo != null) {
                                    var existingImgs = "";
                                    $("#preview_images").empty();
                                    for (var i = 0; i < result.data.WallPostMediaInfo.length; i++) {
                                        var fullImg = "data:image/png;base64," + result.data.WallPostMediaInfo[i].PostImageBase64String;
                                        existingImgs += "<span class='pip pip-container'>";
                                        existingImgs += "<img class='imageThumb' src='" + fullImg + "' />";
                                        existingImgs += "<br/><span ng-click='abccc()' class='remove remove-icon'><a class=''><i class='material-icons'></i></a></span>";
                                        existingImgs += "</span>";
                                    }
                                    $("#preview_images").append(existingImgs);
                                }
                            }
                        });
                        this.$rootScope.$emit("toggleLoader", false);
                    };
                    CompanyWallPostController.prototype.getParameterByName = function () {
                        debugger;
                        var url = window.location.href;
                        var SplitUrl = url.toString().split('/');
                        var pagename = SplitUrl[SplitUrl.length - 1];
                        var splitpagename = pagename.toString().split('?');
                        var wallinfo = splitpagename[1].toString().split('=')[0];
                        if (wallinfo == "wpid")
                            this.scope.isEditMode = true;
                        return splitpagename[1].toString().split('=')[1];
                        //wallinfo = wallinfo.replace(/[\[\]]/g, "\\$&");
                        //var regex = new RegExp("[?&]" + wallinfo + "(=([^&#]*)|&|#|$)"),
                        //    results = regex.exec(url);
                        //if (!results) return null;
                        //if (!results[2]) return '';
                        //return decodeURIComponent(results[2].replace(/\+/g, " "));
                    };
                    CompanyWallPostController.prototype.createWallPost = function () {
                        var _this = this;
                        this.$rootScope.$emit("toggleLoader", true);
                        var imgArray = [];
                        var isImgs = $('#preview_images').html();
                        if (isImgs != "") {
                            var addedImgs = $('#preview_images').find('img');
                            $.each(addedImgs, function () {
                                var base64Arr = [];
                                var imgsrc = this.src;
                                // Split the base64 string in data and contentType
                                var block = imgsrc.split(";");
                                // Get the content type
                                var dataType = block[0].split(":")[1]; // In this case "image/png"
                                // get the real base64 content of the file
                                var realData = block[1].split(",")[1]; // In this case "iVBORw0KGg...."
                                for (var i = 0; i < realData.length; i++) {
                                    base64Arr.push(realData[i]);
                                }
                                imgArray.push(base64Arr);
                            });
                            this.wallpost.WallPostImages = imgArray;
                        }
                        this.wallpost.WallId = this.scope.wallID;
                        this.wallpost.CreatorId = this.$rootScope.LoggedUser.UserId;
                        this.companyWallPostService.createWallPost(this.wallpost).then(function (result) {
                            debugger;
                            if (result.data) {
                                _this.$rootScope.$emit("successnotify", { msg: "Wall Post is created successfully", status: "success" });
                                _this.wallpost = new culamaApp.areas.companyWall.models.WallPost();
                                _this.$rootScope.$emit("toggleLoader", false);
                                window.location.href = "/#/managecompanywallposts?wid=" + _this.scope.wallID;
                            }
                            else {
                                _this.$rootScope.$emit("successnotify", { msg: "Something went wrong. Please try again.", status: "danger" });
                            }
                            _this.$rootScope.$emit("toggleLoader", false);
                        });
                    };
                    CompanyWallPostController.prototype.editWallPost = function () {
                        var _this = this;
                        debugger;
                        this.$rootScope.$emit("toggleLoader", true);
                        var isImgs = $('#preview_images').html();
                        var imgArray = [];
                        if (isImgs != "") {
                            var addedImgs = $('#preview_images').find('.add-new-img').find('img');
                            $.each(addedImgs, function () {
                                debugger;
                                var base64Arr = [];
                                var imgsrc = this.src;
                                // Split the base64 string in data and contentType
                                var block = imgsrc.split(";");
                                // Get the content type
                                var dataType = block[0].split(":")[1]; // In this case "image/png"
                                // get the real base64 content of the file
                                var realData = block[1].split(",")[1]; // In this case "iVBORw0KGg...."
                                for (var i = 0; i < realData.length; i++) {
                                    base64Arr.push(realData[i]);
                                }
                                imgArray.push(base64Arr);
                            });
                            this.wallpost.WallPostImages = imgArray;
                        }
                        debugger;
                        this.wallpost.WallPostMediaInfo = null;
                        this.companyWallPostService.saveWallPostDetails(this.wallpost).then(function (result) {
                            debugger;
                            if (result.data != "") {
                                _this.$rootScope.$emit("successnotify", { msg: "Your information is updated successfully", status: "success" });
                            }
                            else {
                                _this.$rootScope.$emit("successnotify", { msg: "Something went wrong. Please try again.", status: "danger" });
                            }
                        });
                        this.$rootScope.$emit("toggleLoader", false);
                    };
                    CompanyWallPostController.prototype.deleteWallPost = function (wallpostId) {
                        var _this = this;
                        this.$rootScope.$emit("toggleLoader", true);
                        this.companyWallPostService.deleteWallPost(wallpostId).then(function (result) {
                            if (result.data) {
                                var wallPostList = _this.scope.wallPosts;
                                $.each(wallPostList, function (index) {
                                    if (this.Id === wallpostId) {
                                        wallPostList.splice(index, 1);
                                        return false;
                                    }
                                });
                                _this.scope.wallPosts = wallPostList;
                                _this.$rootScope.$emit("successnotify", { msg: "Wall Post is deleted successfully", status: "success" });
                            }
                            else {
                                _this.$rootScope.$emit("successnotify", { msg: "Something went wrong. Please try again.", status: "danger" });
                            }
                            _this.$rootScope.$emit("toggleLoader", false);
                        });
                    };
                    CompanyWallPostController.$inject = ["$scope", "$rootScope", "$sce", "$filter", "companyWallPostService"];
                    return CompanyWallPostController;
                }());
                angular.module("culamaApp")
                    .controller("companyWallPostController", CompanyWallPostController);
            })(controllers = companyWall.controllers || (companyWall.controllers = {}));
        })(companyWall = areas.companyWall || (areas.companyWall = {}));
    })(areas = culamaApp.areas || (culamaApp.areas = {}));
})(culamaApp || (culamaApp = {}));
