(function () {
    'use strict';

    angular
        .module('countries', [])
        .controller('countriesCtrl', CountriesCtrl);

    CountriesCtrl.$inject = [];
    function CountriesCtrl() {
        var ctrl = this;
    }
})();