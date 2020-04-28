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
                        if (o.MEPerson.results) {
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

        svc.getAllItemFilterMEReport = function (filter, programme) {
            var defer = $q.defer();
            svc
                .getAllItems()
                .then(function (medatas) {
                    if (programme) {
                        defer.resolve(_.filter(medatas, function (p) { return p.mereport == filter && p.programme.id == programme.id; }));
                    } else {
                        defer.resolve(_.filter(medatas, ['mereport', filter]));
                    }                    
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
                            mepersonids.push(ShptRestService.ensureUser(value.Login));
                        });

                        $q
                            .all(mepersonids)
                            .then(function (data) {
                                var meidstosave = [];
                                _.forEach(data, function (dt) {
                                    meidstosave.push(dt.Id);
                                });
                                var mereport = true;
                                if (project.mereport == "No") {
                                    mereport = false;
                                }

                                var data = {
                                    Title: project.title,
                                    Code: project.code,
                                    GlobalProgrammeId: project.programme.id,
                                    CountryId: project.country.id,
                                    MEPersonId: { "results": meidstosave },
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

                            })
                            .catch(function (error) {
                                defer.reject("An error occured while getting the User Ids. Contact IT Service desk for support.");
                                console.log(error);
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