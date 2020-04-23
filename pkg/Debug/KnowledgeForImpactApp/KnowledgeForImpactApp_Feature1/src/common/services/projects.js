(function () {
    'use strict';

    angular
        .module('services.projects', [])
        .service('projectsSvc', ProjectsSvc);

    ProjectsSvc.$inject = ['$q', 'ShptRestService'];
    function ProjectsSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'Projects';
        var curUserId = _spPageContextInfo.userId;
        svc.hostWebUrl = ShptRestService.appWebUrl;
        var projectsList = null;

        svc.getAllItems = function () {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,Code,GlobalProgramme/Id,GlobalProgramme/Title,Country/Id,Country/Title,MEPerson/Id,MEPerson/Title,MEReport&$expand=GlobalProgramme,Country,MEPerson";
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    projectsList = [];
                    _.forEach(data.results, function (o) {
                        var project = {};
                        project.id = o.Id;
                        project.title = o.Title;
                        project.code = o.Code;
                        project.programme = _.isNil(o.GlobalProgramme) ? '' : { id: o.GlobalProgramme.Id, title: o.GlobalProgramme.Title };
                        project.country = _.isNil(o.Country) ? '' : { id: o.Country.Id, title: o.Country.Title };
                        project.mereport = o.MEReport;
                        project.meperson = [];
                        if (o.MEPerson.results.length > 0) {
                            _.forEach(o.MEPerson.results, function (p) {
                                var person = {};
                                person.id = p.Id;
                                person.title = p.Title;
                                project.meperson.push(person);
                            });
                        }
                        projectsList.push(project);
                    });
                    defer.resolve(projectsList);
                })
                .catch(function (error) {
                    defer.reject(error);
                });
            return defer.promise;
        };

        svc.AddItem = function (project) {
            var defer = $q.defer();
            svc
                .getAllItems()
                .then(function (response) {
                    var itemExists = _.some(response, function (o) {
                        return o.title == project.title && o.country.title == project.country.title;
                    });

                    if (itemExists) {
                        defer.reject("The item specified already exists in the system. Contact IT Service desk for support.");
                    } else {
                        var mepersonids = [];
                        _.forEach(project.meperson, function (value, key) {
                            mepersonids.push(SP.FieldUserValue.fromUser(value.Login));
                        });

                        var mereport = "";
                        if (project.mereport == "Yes") {
                            mereport = "1";
                        } else if (project.mereport == "No") {
                            mereport = "0";
                        } else {
                            mereport = null;
                        }

                        var data = {
                            Title: project.title,
                            Code: project.code,
                            GlobalProgrammeId: project.programme.id,
                            CountryId: project.country.id,
                            MEPerson: mepersonids,
                            MEReport: mereport
                        };

                        ShptRestService
                            .createNewListItem(listname, data)
                            .then(function (response) {
                                project.id = response.ID;
                                projectsList.push(project);
                                defer.resolve(projectsList);
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
                        _.remove(projectsList, {
                            id: id
                        });
                        defer.resolve(projectsList);
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