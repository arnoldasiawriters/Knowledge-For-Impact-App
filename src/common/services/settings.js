(function () {
    'use strict';

    angular
        .module('services.settings', [])
        .service('settingsSvc', SettingsSvc);

    SettingsSvc.$inject = ['$q', 'ShptRestService'];
    function SettingsSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'ReachDataSettings';
        var curUserId = _spPageContextInfo.userId;
        var settingsList = null;

        svc.getSetting = function (settingCode) {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,SettingCode,SettingValue&$filter=SettingCode eq '" + settingCode + "'";
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    settingsList = [];
                    _.forEach(data.results, function (o) {
                        var setting = {};
                        setting.id = o.Id;
                        setting.title = o.Title;
                        setting.code = o.SettingCode;
                        setting.value = o.SettingValue;
                        settingsList.push(setting);
                    });
                    defer.resolve(settingsList);
                })
                .catch(function (error) {
                    defer.reject(error);
                });
            return defer.promise;
        };

        svc.UpdateItem = function (setting) {
            var defEditSetting = $q.defer();
            var data = {
                SettingValue: setting.value
            };
            ShptRestService
                .updateListItem(listname, setting.id, data)
                .then(function (response) {
                    defEditSetting.resolve(true);
                })
                .catch(function (error) {
                    console.log(error);
                    defEditSetting.reject("An error occured while editing the item. Contact IT Service desk for support.");
                });
            return defEditSetting.promise;
        };
    }
})();