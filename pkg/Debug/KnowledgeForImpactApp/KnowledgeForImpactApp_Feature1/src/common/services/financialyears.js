(function () {
    'use strict';

    angular
        .module('services.years', [])
        .service('YearsSvc', FinancialYearsSvc);

    FinancialYearsSvc.$inject = ['$q', 'ShptRestService'];
    function FinancialYearsSvc($q, ShptRestService){
        var svc = this;
        var listname = 'FinancialYears';
        var curUserId = _spPageContextInfo.userId;
        var yearsList = null;

        svc.getAllItems = function () {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title";
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    yearsList = [];
                    _.forEach(data.results, function (o) {
                        var year = {};
                        year.id = o.Id;
                        year.title = o.Title;
                        yearsList.push(year);
                    });
                    defer.resolve(yearsList);
                })
                .catch(function (error) {
                    defer.reject(error);
                });
            return defer.promise;
        };
    }

})();