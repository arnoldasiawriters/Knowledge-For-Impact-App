(function () {
    'use strict';

    angular
        .module('services.doctypes', [])
        .service('docTypesSvc', DocTypeSvc);

    DocTypeSvc.$inject = ['$q', 'ShptRestService'];
    function DocTypeSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'DocumentTypes';
        var curUserId = _spPageContextInfo.userId;
        var docTypeList = null;

        svc.getAllItems = function () {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title";
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    docTypeList = [];
                    _.forEach(data.results, function (o) {
                        var type = {};
                        type.id = o.Id;
                        type.title = o.Title;
                        docTypeList.push(type);
                    });
                    defer.resolve(docTypeList);
                })
                .catch(function (error) {
                    defer.reject(error);
                });
            return defer.promise;
        };

        svc.AddItem = function (doctype) {
            var defer = $q.defer();
            var itemExists = _.some(docTypeList, ['title', doctype.title]);

            if (itemExists) {
                defer.reject("The item specified already exists in the system. Contact IT Service desk for support.");
            } else {

                var data = {
                    Title: doctype.title
                };

                ShptRestService
                    .createNewListItem(listname, data)
                    .then(function (response) {
                        doctype.id = response.ID;
                        docTypeList.push(doctype);
                        defer.resolve(docTypeList);
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
                        _.remove(docTypeList, {
                            id: id
                        });
                        defer.resolve(docTypeList);
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