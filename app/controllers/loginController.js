/// <reference path="../../Scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../Scripts/typings/angularjs/angular-route.d.ts" />
var altairApp;
(function (altairApp) {
    var LoginController = (function () {
        function LoginController(scope, $rootScope, loginService) {
            this.scope = scope;
            this.$rootScope = $rootScope;
            this.loginService = loginService;
            this.loginuser = new altairApp.LoginUser();
            scope.vm = this;
            this.lservice = loginService;
            scope.vm.selectize_a_options = [
                { id: 1, title: 'English', value: 'EN' },
                { id: 2, title: 'Hindi', value: 'HI' }
            ];
            scope.vm.selectize_a_config = {
                plugins: {
                    'tooltip': ''
                },
                create: false,
                maxItems: 1,
                placeholder: 'Select...',
                valueField: 'value',
                labelField: 'title',
                onChange: function (value) {
                    // Nothing happens when typing into input
                    this.changeLanguage();
                }
            };
            scope.vm.registerFormActive = false;
            scope.vm.isloginfail = false;
            var $formValidate = $('#myLoginForm');
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
        LoginController.prototype.login = function () {
            var _this = this;
            this.$rootScope.$emit("toggleLoader", true);
            this.lservice.login(this.loginuser).then(function (result) {
                if (result.data.Username != null) {
                    if (typeof (Storage) !== "undefined") {
                        localStorage.setItem("loggeduser", JSON.stringify(result.data));
                    }
                    window.location.href = "/";
                }
                else {
                    _this.$rootScope.$emit("toggleLoader", false);
                    _this.scope.vm.isloginfail = true;
                }
            });
        };
        LoginController.prototype.changeLanguage = function () {
            this.$rootScope.$emit("changeLanguage", this.scope.vm.selectize_a);
        };
        return LoginController;
    }());
    LoginController.$inject = ["$scope", "$rootScope", "loginService"];
    angular.module("altairApp")
        .controller("loginController", LoginController);
})(altairApp || (altairApp = {}));
