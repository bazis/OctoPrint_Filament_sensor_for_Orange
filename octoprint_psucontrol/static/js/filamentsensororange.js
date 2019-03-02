$(function() {
    function FilamentSensorViewModel(parameters) {
        var self = this;

        self.settingsViewModel = parameters[0];
        self.loginState = parameters[1];
        self.settings = undefined;
        self.hasGPIO = ko.observable(undefined);
        self.isFilamentOn = ko.observable(undefined);
        self.filament_indicator = $("#psucontrol_indicator");

        self.onBeforeBinding = function() {
            self.settings = self.settingsViewModel.settings;
        };

        self.onStartup = function () {
            self.isFilamentOn.subscribe(function() {
                if (self.isFilamentOn()) {
                    self.filament_indicator.removeClass("off").addClass("on");
                } else {
                    self.filament_indicator.removeClass("on").addClass("off");
                }
            });

            $.ajax({
                url: API_BASEURL + "plugin/filamentsensororange",
                type: "POST",
                dataType: "json",
                data: JSON.stringify({
                    command: "getFilamentState"
                }),
                contentType: "application/json; charset=UTF-8"
            }).done(function(data) {
                self.isFilamentOn(data.isFilamentOn);
            });
        };

        self.onDataUpdaterPluginMessage = function(plugin, data) {
            if (plugin != "filamentsensororange") {
                return;
            }

            self.hasGPIO(data.hasGPIO);
            self.isFilamentOn(data.isFilamentOn);
        };

        self.toggleFilament = function() {
            if (self.isFilamentOn()) {
                if (self.settings.plugins.filamentsensororange.enableFilamentOffWarningDialog()) { //TODO выключение сенсора филамента
                    showConfirmationDialog({
                        message: "You are about to turn off filament.",
                        onproceed: function() {
                            self.turnFilamentOff();
                        }
                    });
                } else {
                    self.turnFilamentOff();
                }
            } else {
                self.turnFilamentOn();
            }
        };

        self.turnFilamentOn = function() {
            $.ajax({
                url: API_BASEURL + "plugin/filamentsensororange",
                type: "POST",
                dataType: "json",
                data: JSON.stringify({
                    command: "turnFilamentOn"
                }),
                contentType: "application/json; charset=UTF-8"
            })
        };

    	self.turnFilamentOff = function() {
            $.ajax({
                url: API_BASEURL + "plugin/filamentsensororange",
                type: "POST",
                dataType: "json",
                data: JSON.stringify({
                    command: "turnFilamentOff"
                }),
                contentType: "application/json; charset=UTF-8"
            })
        };
    }

    ADDITIONAL_VIEWMODELS.push([
        FilamentSensorViewModel,
        ["settingsViewModel", "loginStateViewModel"],
        ["#navbar_plugin_psucontrol", "#settings_plugin_psucontrol"]
    ]);
});
