(function () {
    'use strict';

    angular
        .module('services.quarters', [])
        .service('quartersSvc', QuartersSvc);

    QuartersSvc.$inject = ['$q', 'ShptRestService'];
    function QuartersSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'FinancialQuarters';
        var curUserId = _spPageContextInfo.userId;
        var quartersList = null;

        svc.getAllItems = function () {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,FinancialYear/Id,FinancialYear/Title,StartDate,EndDate,EndofEntryDate,Abbr&$expand=FinancialYear";
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    quartersList = [];
                    _.forEach(data.results, function (o) {
                        var quarter = {};
                        quarter.id = o.Id;
                        quarter.title = o.Title;
                        quarter.year = _.isNil(o.FinancialYear) ? '': { id: o.FinancialYear.Id, title: o.FinancialYear.Title };
                        quarter.startdate = o.StartDate;
                        quarter.enddate = o.EndDate;
                        quarter.endofentrydate = o.EndofEntryDate;
                        quarter.abbr = o.Abbr;
                        quartersList.push(quarter);
                    });
                    defer.resolve(quartersList);
                })
                .catch(function (error) {
                    defer.reject(error);
                });
            return defer.promise;
        };

        svc.getAllItemsYear = function (year) {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,FinancialYear/Id,FinancialYear/Title,StartDate,EndDate,EndofEntryDate,Abbr&$expand=FinancialYear&$filter=FinancialYear/Title eq '" + year + "'";
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    quartersList = [];
                    _.forEach(data.results, function (o) {
                        var quarter = {};
                        quarter.id = o.Id;
                        quarter.title = o.Title;
                        quarter.year = _.isNil(o.FinancialYear) ? '' : { id: o.FinancialYear.Id, title: o.FinancialYear.Title };
                        quarter.startdate = o.StartDate;
                        quarter.enddate = o.EndDate;
                        quarter.endofentrydate = o.EndofEntryDate;
                        quarter.abbr = o.Abbr;
                        quartersList.push(quarter);
                    });
                    defer.resolve(quartersList);
                })
                .catch(function (error) {
                    defer.reject(error);
                });
            return defer.promise;
        };
    }
})();