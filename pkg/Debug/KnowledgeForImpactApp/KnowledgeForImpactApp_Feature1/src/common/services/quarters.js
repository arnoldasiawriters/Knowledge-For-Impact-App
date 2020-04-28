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
                    defer.reject("An error occured while retrieving all items. Contact IT Service desk for support.");
                    console.log(error);
                });
            return defer.promise;
        };

        svc.getAllItemsYear = function (year) {
            var defer = $q.defer();
            svc
                .getAllItems()
                .then(function (response) {
                    defer.resolve(_.filter(response, function (o) { return o.year.id == year.id; }));
                })
                .catch(function (error) {
                    defer.reject("An error occured while retrieving the items. Contact IT Service desk for support.");
                    console.log(error);
                });
            return defer.promise;
        };

        svc.AddItem = function (quarter) {
            var defer = $q.defer();
            svc
                .getAllItems()
                .then(function (response) {
                    var itemExists =_.some(response, function (o) {
                        return o.title == quarter.title && o.year.title == quarter.year.title;
                    });
                    if (itemExists) {
                        defer.reject("The item specified already exists in the system. Contact IT Service desk for support.");
                    } else {
                        var data = {
                            Title: quarter.title,
                            FinancialYearId: quarter.year.id,
                            StartDate: quarter.startdate,
                            EndDate: quarter.enddate,
                            EndofEntryDate: quarter.endofentrydate,
                            Abbr: quarter.abbr
                        };

                        ShptRestService
                            .createNewListItem(listname, data)
                            .then(function (response) {
                                quarter.id = response.ID;
                                quartersList.push(quarter);
                                defer.resolve(quartersList);
                            })
                            .catch(function (error) {
                                console.log(error);
                                defer.reject("An error occured while adding the item. Contact IT Service desk for support.");
                            });
                    }
                })
                .catch(function (error) {
                    defer.reject("An error occured while retrieving the items. Contact IT Service desk for support.");
                    console.log(error);
                });
            return defer.promise;
        };

        svc.DeleteItem = function (id) {
            var defer = $q.defer();
            if (id) {
                ShptRestService
                    .deleteListItem(listname, id)
                    .then(function () {
                        _.remove(quartersList, {
                            id: id
                        });
                        defer.resolve(quartersList);
                    })
                    .catch(function (error) {
                        console.log(error);
                        defer.reject("An error occured while deleting the item. Contact IT Service desk for support.");
                    });
            } else {
                defer.reject('Item to be deleted is missing Id. Contact IT Service desk for support.');
            }
            return defer.promise;
        };
    }
})();