(function () {
    'use strict';

    angular
        .module('services.programmes', [])
        .service('programmesSvc', ProgrammesSvc);

    ProgrammesSvc.$inject = ['$q', 'ShptRestService'];
    function ProgrammesSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'GlobalProgrammes';
        var curUserId = _spPageContextInfo.userId;
        var progsList = null;

        svc.getAllItems = function () {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title";
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    progsList = [];
                    _.forEach(data.results, function (o) {
                        var prog = {};
                        prog.id = o.Id;
                        prog.title = o.Title;
                        progsList.push(prog);
                    });
                    defer.resolve(progsList);
                })
                .catch(function (error) {
                    defer.reject(error);
                });
            return defer.promise;
        };

        svc.AddItem = function (programme) {
            var defer = $q.defer();
            var itemExists = _.some(progsList, ['title', programme.title]);

            if (itemExists) {
                defer.reject("The item specified already exists in the system. Contact IT Service desk for support.");
            } else {

                var data = {
                    Title: programme.title
                };

                ShptRestService
                    .createNewListItem(listname, data)
                    .then(function (response) {
                        programme.id = response.ID;
                        progsList.push(programme);
                        defer.resolve(progsList);
                    })
                    .catch(function (error) {
                        console.log(error);
                        defer.reject("An error occured while adding the item. Contact IT Service desk for support.");
                    });
            }
            return defer.promise;
        };

        svc.DeleteItem = function (id) {
            var defer = $q.defer();
            if (id) {
                ShptRestService
                    .deleteListItem(listname, id)
                    .then(function () {
                        _.remove(progsList, {
                            id: id
                        });
                        defer.resolve(progsList);
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