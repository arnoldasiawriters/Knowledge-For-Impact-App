(function () {
    'use strict';

    angular
        .module('grants', [])
        .controller('grantsCtrl', GrantsCtrl);

    GrantsCtrl.$inject = [];
    function GrantsCtrl() {
        var ctrl = this;
    }
})();