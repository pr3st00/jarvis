'use strict'

const SERVICES_CONFIG_FILE = "../config/services.json";

function getServiceConfig(name)
{
    var serviceConfig = JSON.parse(SERVICES_CONFIG_FILE);

    for (var service in serviceConfig.jarvis.services)
    {
        if (name === service)
        {
            return service.implementation;
        }

    }

    return undef;
}