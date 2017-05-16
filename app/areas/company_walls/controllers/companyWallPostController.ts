﻿
/// <reference path="../../../../Scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../../../Scripts/typings/angularjs/angular-route.d.ts" />

module culamaApp.areas.companyWall.controllers {
    class CompanyWallPostController {
        public wallpost: culamaApp.areas.companyWall.models.WallPost = new culamaApp.areas.companyWall.models.WallPost();
        static $inject = ["$scope", "$rootScope", "$sce", "$compile", "$filter", "companyWallPostService"];

        constructor(public scope: any, public $rootScope: any, public $sce: any, public $compile: any, public $filter: any, public companyWallPostService: culamaApp.CompanyWallPostService) {
            var currObj = this;
            var currUrl;
            this.scope.isWallPosts = false;
            this.scope.isEditMode = false;
            //this.scope.wallID = this.getParameterByName("wid");
            this.scope.wallID = this.getParameterByName();
            debugger;
            if (this.scope.isEditMode == false) {
                this.getWallInfo(this.scope.wallID);
                this.getWallPosts(this.scope.wallID);
            }
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
            }

            this.scope.deleteWallPost = function (wallpostId) {
                UIkit.modal.confirm('Are you sure want to delete?', function () {
                    currObj.deleteWallPost(wallpostId);
                });
            }

            this.scope.removeExistingImg = function (existingImgId) {
                if (currObj.wallpost.RemoveExistingImageIds == null)
                    currObj.wallpost.RemoveExistingImageIds = existingImgId;
                else
                    currObj.wallpost.RemoveExistingImageIds += "," + existingImgId;
                $('#span' + existingImgId).remove();
            }
        }

        getWallInfo(wallId) {
            this.$rootScope.$emit("toggleLoader", true);
            this.companyWallPostService.getWallInfoByWallId(wallId).then((result: ng.IHttpPromiseCallbackArg<culamaApp.areas.companyWall.models.Wall>) => {
                if (result.data != null) {
                    if (result.data.WallBase64String != null)
                        result.data.WallBase64String = "data:image/jpeg;base64," + result.data.WallBase64String.toString();
                    else
                        result.data.WallBase64String = "assets/img/avatars/avatar_02.png";
                    this.scope.wallDetails = result.data;
                }
                this.$rootScope.$emit("toggleLoader", false);
            });
        }

        getWallPosts(wallId) {
            this.$rootScope.$emit("toggleLoader", true);
            var currentObj = this;
            var ft = this.$filter;
            this.companyWallPostService.getCompanyWallPostsByWallId(wallId).then((result: ng.IHttpPromiseCallbackArg<any>) => {
                debugger;
                if (result.data.length > 0) {
                    $.each(result.data, function () {
                        if (typeof this.CreatedOn === 'string') {
                            var activationon = new Date(parseInt(this.CreatedOn.substr(6)));
                            this.CreatedOn = ft('date')(activationon, "dd MMM yyyy");
                        }
                    });
                    this.scope.isWallPosts = true;
                    this.scope.wallPosts = result.data;
                }
            });
            this.$rootScope.$emit("toggleLoader", false);
        }

        getWallPostDetailsByWallPostId(wallPostId) {
            this.$rootScope.$emit("toggleLoader", true);
            var ft = this.$filter;
            this.companyWallPostService.getCompanyWallPostInfoByPostId(wallPostId).then((result: ng.IHttpPromiseCallbackArg<culamaApp.areas.companyWall.models.WallPost>) => {
                if (result.data != null) {
                    this.wallpost = result.data;

                    if (result.data.WallPostMediaInfo != null) {
                        var existingImgs = "";
                        $("#preview_images").empty();
                        for (var i = 0; i < result.data.WallPostMediaInfo.length; i++) {

                            var fullImg = "data:image/png;base64," + result.data.WallPostMediaInfo[i].PostImageBase64String;

                            existingImgs += "<span id='span" + result.data.WallPostMediaInfo[i].Id + "' class='pip pip-container'>";
                            existingImgs += "<img class='imageThumb' src='" + fullImg + "' />";
                            existingImgs += "<br/><span ng-click='removeExistingImg(" + result.data.WallPostMediaInfo[i].Id + ")' class='remove remove-icon'><a class=''><i class='material-icons'></i></a></span>";
                            existingImgs += "</span>";
                        }
                        var compileDivInfo = this.$compile(existingImgs)(this.scope);
                        $("#preview_images").append(compileDivInfo);
                    }
                }
            });
            this.$rootScope.$emit("toggleLoader", false);
        }

        getParameterByName() {
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
        }

        createWallPost() {
            debugger;
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
                    var dataType = block[0].split(":")[1];// In this case "image/png"

                    // get the real base64 content of the file
                    var realData = block[1].split(",")[1];// In this case "iVBORw0KGg...."

                    for (var i = 0; i < realData.length; i++) {
                        base64Arr.push(realData[i]);
                    }
                    imgArray.push(base64Arr);
                });
                this.wallpost.WallPostImages = imgArray;
            }

            this.wallpost.WallId = this.scope.wallID;
            this.wallpost.CreatorId = this.$rootScope.LoggedUser.UserId;

            this.companyWallPostService.createWallPost(this.wallpost).then((result: ng.IHttpPromiseCallbackArg<culamaApp.areas.companyWall.models.WallPost>) => {
                if (result.data) {
                    this.$rootScope.$emit("successnotify",
                        { msg: "Wall Post is created successfully", status: "success" });

                    this.wallpost = new culamaApp.areas.companyWall.models.WallPost();
                    this.$rootScope.$emit("toggleLoader", false);
                    window.location.href = "/#/managecompanywallposts?wid=" + this.scope.wallID;
                } else {
                    this.$rootScope.$emit("successnotify",
                        { msg: "Something went wrong. Please try again.", status: "danger" });
                }
                this.$rootScope.$emit("toggleLoader", false);
            });
        }

        editWallPost() {
            this.$rootScope.$emit("toggleLoader", true);
            var isImgs = $('#preview_images').html();
            var imgArray = [];
            if (isImgs != "") {
                var addedImgs = $('#preview_images').find('.add-new-img').find('img');

                $.each(addedImgs, function () {
                    var base64Arr = [];
                    var imgsrc = this.src;

                    // Split the base64 string in data and contentType
                    var block = imgsrc.split(";");

                    // Get the content type
                    var dataType = block[0].split(":")[1];// In this case "image/png"

                    // get the real base64 content of the file
                    var realData = block[1].split(",")[1];// In this case "iVBORw0KGg...."

                    for (var i = 0; i < realData.length; i++) {
                        base64Arr.push(realData[i]);
                    }
                    imgArray.push(base64Arr);
                });
                this.wallpost.WallPostImages = imgArray;
            }
            this.wallpost.WallPostMediaInfo = null;
            this.companyWallPostService.saveWallPostDetails(this.wallpost).then((result: ng.IHttpPromiseCallbackArg<culamaApp.areas.companyWall.models.WallPost>) => {
                if (result.data != "") {
                    this.$rootScope.$emit("successnotify",
                        { msg: "Your information is updated successfully", status: "success" });
                } else {
                    this.$rootScope.$emit("successnotify",
                        { msg: "Something went wrong. Please try again.", status: "danger" });
                }
                this.$rootScope.$emit("toggleLoader", false);
            });
        }

        deleteWallPost(wallpostId) {
            this.$rootScope.$emit("toggleLoader", true);
            this.companyWallPostService.deleteWallPost(wallpostId).then((result: ng.IHttpPromiseCallbackArg<boolean>) => {
                if (result.data) {
                    var wallPostList = this.scope.wallPosts;
                    $.each(wallPostList, function (index) {
                        if (this.Id === wallpostId) {
                            wallPostList.splice(index, 1);
                            return false;
                        }
                    });
                    this.scope.wallPosts = wallPostList;
                    this.$rootScope.$emit("successnotify",
                        { msg: "Wall Post is deleted successfully", status: "success" });
                } else {
                    this.$rootScope.$emit("successnotify",
                        { msg: "Something went wrong. Please try again.", status: "danger" });
                }
                this.$rootScope.$emit("toggleLoader", false);
            });
        }

    }

    angular.module("culamaApp")
        .controller("companyWallPostController", CompanyWallPostController);
}