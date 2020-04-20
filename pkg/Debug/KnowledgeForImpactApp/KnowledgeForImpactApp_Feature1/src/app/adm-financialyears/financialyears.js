(function () {
    'use strict';

    angular
        .module('financialyears', [])
        .controller('financialyearsCtrl', FinancialyearsCtrl);

    FinancialyearsCtrl.$inject = ['$q', 'YearsSvc', 'spinnerService'];
    function FinancialyearsCtrl($q, YearsSvc, spinnerService) {
        var ctrl = this;
        ctrl.year = {};
        spinnerService.show('spinner1');
        var promises = [];
        promises.push(YearsSvc.getAllItems());
        $q
            .all(promises)
            .then(function (data) {
                ctrl.years = data[0];
                spinnerService.closeAll();
            })
            .catch(function (error) {
                console.log("An error occured when getting years!", error);
            });
    }
})();