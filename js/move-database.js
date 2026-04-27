/* ==========================================================
   Azure Move Support Database
   Source: Microsoft official docs (azure-docs repo)
   https://github.com/MicrosoftDocs/azure-docs/blob/main/articles/azure-resource-manager/management/move-support-resources.md
   Auto-updated weekly via .github/workflows/update-database.yml
   Format: "Provider/Type,moveRG,moveSub,moveRegion"
     1 = Yes, 0 = No
   ========================================================== */

const MOVE_DB_RAW = `microsoft.aad/domainservices,0,0,0
microsoft.aadiam/diagnosticsettings,0,0,0
microsoft.aadiam/diagnosticsettingscategories,0,0,0
microsoft.aadiam/privatelinkforazuread,1,1,0
microsoft.aadiam/tenants,1,1,0
microsoft.addons/supportproviders,0,0,0
microsoft.adhybridhealthservice/aadsupportcases,0,0,0
microsoft.adhybridhealthservice/addsservices,0,0,0
microsoft.adhybridhealthservice/agents,0,0,0
microsoft.adhybridhealthservice/anonymousapiusers,0,0,0
microsoft.adhybridhealthservice/configuration,0,0,0
microsoft.adhybridhealthservice/logs,0,0,0
microsoft.adhybridhealthservice/reports,0,0,0
microsoft.adhybridhealthservice/servicehealthmetrics,0,0,0
microsoft.adhybridhealthservice/services,0,0,0
microsoft.advisor/configurations,0,0,0
microsoft.advisor/generaterecommendations,0,0,0
microsoft.advisor/metadata,0,0,0
microsoft.advisor/recommendations,0,0,0
microsoft.advisor/suppressions,0,0,0
microsoft.alertsmanagement/alertprocessingrules,0,1,0
microsoft.alertsmanagement/alerts,0,0,0
microsoft.alertsmanagement/alertslist,0,0,0
microsoft.alertsmanagement/alertsmetadata,0,0,0
microsoft.alertsmanagement/alertssummary,0,0,0
microsoft.alertsmanagement/alertssummarylist,0,0,0
microsoft.alertsmanagement/smartdetectoralertrules,1,1,0
microsoft.alertsmanagement/smartgroups,0,0,0
microsoft.analysisservices/servers,1,1,0
microsoft.apimanagement/reportfeedback,0,0,0
microsoft.apimanagement/service,1,1,1
microsoft.app/managedenvironments,1,1,0
microsoft.appconfiguration/configurationstores,1,1,0
microsoft.appconfiguration/configurationstores/eventgridfilters,0,0,0
microsoft.appplatform/spring,1,1,0
microsoft.appservice/apiapps,0,0,1
microsoft.appservice/appidentities,0,0,0
microsoft.appservice/gateways,0,0,0
microsoft.attestation/attestationproviders,0,0,0
microsoft.authorization/classicadministrators,0,0,0
microsoft.authorization/dataaliases,0,0,0
microsoft.authorization/denyassignments,0,0,0
microsoft.authorization/elevateaccess,0,0,0
microsoft.authorization/findorphanroleassignments,0,0,0
microsoft.authorization/locks,0,0,0
microsoft.authorization/permissions,0,0,0
microsoft.authorization/policyassignments,0,0,0
microsoft.authorization/policydefinitions,0,0,0
microsoft.authorization/policysetdefinitions,0,0,0
microsoft.authorization/privatelinkassociations,0,0,0
microsoft.authorization/resourcemanagementprivatelinks,0,0,0
microsoft.authorization/roleassignments,0,0,0
microsoft.authorization/roleassignmentsusagemetrics,0,0,0
microsoft.authorization/roledefinitions,0,0,0
microsoft.automation/automationaccounts,1,1,0
microsoft.automation/automationaccounts/configurations,1,1,0
microsoft.automation/automationaccounts/runbooks,1,1,0
microsoft.avs/privateclouds,1,1,0
microsoft.azureactivedirectory/b2cdirectories,1,1,0
microsoft.azureactivedirectory/b2ctenants,0,0,0
microsoft.azurearcdata/datacontrollers,0,0,0
microsoft.azurearcdata/postgresinstances,0,0,0
microsoft.azurearcdata/sqlmanagedinstances,0,0,0
microsoft.azurearcdata/sqlserverinstances,0,0,0
microsoft.azurearcdata/sqlserverlicenses,0,0,0
microsoft.azuredata/datacontrollers,0,0,0
microsoft.azuredata/hybriddatamanagers,0,0,0
microsoft.azuredata/postgresinstances,0,0,0
microsoft.azuredata/sqlinstances,0,0,0
microsoft.azuredata/sqlmanagedinstances,0,0,0
microsoft.azuredata/sqlserverinstances,0,0,0
microsoft.azuredata/sqlserverregistrations,1,1,0
microsoft.azurestack/cloudmanifestfiles,0,0,0
microsoft.azurestack/registrations,1,1,0
microsoft.azurestackhci/clusters,0,0,0
microsoft.batch/batchaccounts,1,1,0
microsoft.billing/billingaccounts,0,0,0
microsoft.billing/billingperiods,0,0,0
microsoft.billing/billingpermissions,0,0,0
microsoft.billing/billingproperty,0,0,0
microsoft.billing/billingroleassignments,0,0,0
microsoft.billing/billingroledefinitions,0,0,0
microsoft.billing/departments,0,0,0
microsoft.billing/enrollmentaccounts,0,0,0
microsoft.billing/invoices,0,0,0
microsoft.billing/transfers,0,0,0
microsoft.bingmaps/mapapis,0,0,0
microsoft.biztalkservices/biztalk,0,0,0
microsoft.blockchain/blockchainmembers,0,0,0
microsoft.blockchain/cordamembers,0,0,0
microsoft.blockchain/watchers,0,0,0
microsoft.blockchaintokens/tokenservices,0,0,0
microsoft.blueprint/blueprintassignments,0,0,0
microsoft.blueprint/blueprints,0,0,0
microsoft.botservice/botservices,1,1,0
microsoft.cache/redis,1,1,0
microsoft.cache/redisenterprise,0,0,0
microsoft.capacity/appliedreservations,0,0,0
microsoft.capacity/calculateexchange,0,0,0
microsoft.capacity/calculateprice,0,0,0
microsoft.capacity/calculatepurchaseprice,0,0,0
microsoft.capacity/catalogs,0,0,0
microsoft.capacity/commercialreservationorders,0,0,0
microsoft.capacity/exchange,0,0,0
microsoft.capacity/reservationorders,0,0,0
microsoft.capacity/reservations,0,0,0
microsoft.capacity/resources,0,0,0
microsoft.capacity/validatereservationorder,0,0,0
microsoft.cdn/cdnwebapplicationfirewallmanagedrulesets,0,0,0
microsoft.cdn/cdnwebapplicationfirewallpolicies,1,1,0
microsoft.cdn/edgenodes,0,0,0
microsoft.cdn/profiles,1,1,0
microsoft.cdn/profiles/endpoints,1,1,0
microsoft.certificateregistration/certificateorders,1,1,0
microsoft.classiccompute/capabilities,0,0,0
microsoft.classiccompute/domainnames,1,0,0
microsoft.classiccompute/quotas,0,0,0
microsoft.classiccompute/resourcetypes,0,0,0
microsoft.classiccompute/validatesubscriptionmoveavailability,0,0,0
microsoft.classiccompute/virtualmachines,1,1,0
microsoft.classicinfrastructuremigrate/classicinfrastructureresources,0,0,0
microsoft.classicnetwork/capabilities,0,0,0
microsoft.classicnetwork/expressroutecrossconnections,0,0,0
microsoft.classicnetwork/expressroutecrossconnections/peerings,0,0,0
microsoft.classicnetwork/gatewaysupporteddevices,0,0,0
microsoft.classicnetwork/networksecuritygroups,0,0,0
microsoft.classicnetwork/quotas,0,0,0
microsoft.classicnetwork/reservedips,0,0,0
microsoft.classicnetwork/virtualnetworks,0,0,0
microsoft.classicstorage/disks,0,0,0
microsoft.classicstorage/images,0,0,0
microsoft.classicstorage/osimages,0,0,0
microsoft.classicstorage/osplatformimages,0,0,0
microsoft.classicstorage/publicimages,0,0,0
microsoft.classicstorage/quotas,0,0,0
microsoft.classicstorage/storageaccounts,1,0,1
microsoft.classicstorage/vmimages,0,0,0
microsoft.classicsubscription/operations,0,0,0
microsoft.cognitiveservices/accounts,1,1,0
microsoft.commerce/ratecard,0,0,0
microsoft.commerce/usageaggregates,0,0,0
microsoft.communication/communicationservices,1,1,0
microsoft.compute/availabilitysets,1,1,1
microsoft.compute/capabilities,0,0,0
microsoft.compute/diskaccesses,0,0,0
microsoft.compute/diskencryptionsets,0,0,0
microsoft.compute/disks,1,1,1
microsoft.compute/domainnames,1,0,0
microsoft.compute/galleries,0,0,0
microsoft.compute/galleries/images,0,0,0
microsoft.compute/galleries/images/versions,0,0,0
microsoft.compute/hostgroups,0,0,0
microsoft.compute/hostgroups/hosts,0,0,0
microsoft.compute/images,1,1,0
microsoft.compute/proximityplacementgroups,1,1,0
microsoft.compute/quotas,0,0,0
microsoft.compute/resourcetypes,0,0,0
microsoft.compute/restorepointcollections,0,0,0
microsoft.compute/restorepointcollections/restorepoints,0,0,0
microsoft.compute/sharedvmextensions,0,0,0
microsoft.compute/sharedvmimages,0,0,0
microsoft.compute/sharedvmimages/versions,0,0,0
microsoft.compute/snapshots,1,1,0
microsoft.compute/sshpublickeys,0,0,0
microsoft.compute/validatesubscriptionmoveavailability,0,0,0
microsoft.compute/virtualmachines,1,1,1
microsoft.compute/virtualmachines/extensions,1,1,0
microsoft.compute/virtualmachinescalesets,1,1,0
microsoft.confluent/organizations,0,0,0
microsoft.consumption/aggregatedcost,0,0,0
microsoft.consumption/balances,0,0,0
microsoft.consumption/budgets,0,0,0
microsoft.consumption/charges,0,0,0
microsoft.consumption/costtags,0,0,0
microsoft.consumption/credits,0,0,0
microsoft.consumption/events,0,0,0
microsoft.consumption/forecasts,0,0,0
microsoft.consumption/lots,0,0,0
microsoft.consumption/marketplaces,0,0,0
microsoft.consumption/pricesheets,0,0,0
microsoft.consumption/products,0,0,0
microsoft.consumption/reservationdetails,0,0,0
microsoft.consumption/reservationrecommendationdetails,0,0,0
microsoft.consumption/reservationrecommendations,0,0,0
microsoft.consumption/reservationsummaries,0,0,0
microsoft.consumption/reservationtransactions,0,0,0
microsoft.consumption/tags,0,0,0
microsoft.consumption/tenants,0,0,0
microsoft.consumption/terms,0,0,0
microsoft.consumption/usagedetails,0,0,0
microsoft.containerinstance/containergroups,0,0,0
microsoft.containerinstance/serviceassociationlinks,0,0,0
microsoft.containerregistry/registries,1,1,0
microsoft.containerregistry/registries/agentpools,1,1,0
microsoft.containerregistry/registries/buildtasks,1,1,0
microsoft.containerregistry/registries/replications,1,1,0
microsoft.containerregistry/registries/tasks,1,1,0
microsoft.containerregistry/registries/webhooks,1,1,0
microsoft.containerservice/containerservices,0,0,0
microsoft.containerservice/managedclusters,0,0,0
microsoft.containerservice/openshiftmanagedclusters,0,0,0
microsoft.contentmoderator/applications,0,0,0
microsoft.cortanaanalytics/accounts,0,0,0
microsoft.costmanagement/alerts,0,0,0
microsoft.costmanagement/billingaccounts,0,0,0
microsoft.costmanagement/budgets,0,0,0
microsoft.costmanagement/cloudconnectors,0,0,0
microsoft.costmanagement/connectors,1,1,0
microsoft.costmanagement/departments,0,0,0
microsoft.costmanagement/dimensions,0,0,0
microsoft.costmanagement/enrollmentaccounts,0,0,0
microsoft.costmanagement/exports,0,0,0
microsoft.costmanagement/externalbillingaccounts,0,0,0
microsoft.costmanagement/forecast,0,0,0
microsoft.costmanagement/query,0,0,0
microsoft.costmanagement/register,0,0,0
microsoft.costmanagement/reportconfigs,0,0,0
microsoft.costmanagement/reports,0,0,0
microsoft.costmanagement/settings,0,0,0
microsoft.costmanagement/showbackrules,0,0,0
microsoft.costmanagement/views,0,0,0
microsoft.customerinsights/hubs,0,0,0
microsoft.customerlockbox/requests,0,0,0
microsoft.customproviders/associations,0,0,0
microsoft.customproviders/resourceproviders,1,1,0
microsoft.databox/jobs,0,0,0
microsoft.databoxedge/availableskus,0,0,0
microsoft.databoxedge/databoxedgedevices,0,0,0
microsoft.databricks/accessconnectors,0,0,0
microsoft.databricks/workspaces,0,0,0
microsoft.datacatalog/catalogs,1,1,0
microsoft.datacatalog/datacatalogs,0,0,0
microsoft.dataconnect/connectionmanagers,0,0,0
microsoft.datadog/monitors,0,0,0
microsoft.dataexchange/packages,0,0,0
microsoft.dataexchange/plans,0,0,0
microsoft.datafactory/datafactories,1,1,0
microsoft.datafactory/factories,1,1,0
microsoft.datalake/datalakeaccounts,0,0,0
microsoft.datalakeanalytics/accounts,1,1,0
microsoft.datalakestore/accounts,1,1,0
microsoft.datamigration/services,0,0,0
microsoft.datamigration/services/projects,0,0,0
microsoft.datamigration/slots,0,0,0
microsoft.datamigration/sqlmigrationservices,0,0,0
microsoft.dataprotection/backupvaults,1,1,0
microsoft.datashare/accounts,1,1,0
microsoft.dbformysql/flexibleservers,1,1,0
microsoft.dbforpostgresql/flexibleservers,1,1,0
microsoft.dbforpostgresql/servergroups,0,0,0
microsoft.dbforpostgresql/servers,1,1,0
microsoft.deploymentmanager/artifactsources,1,1,0
microsoft.deploymentmanager/rollouts,1,1,0
microsoft.deploymentmanager/servicetopologies,1,1,0
microsoft.deploymentmanager/servicetopologies/services,1,1,0
microsoft.deploymentmanager/servicetopologies/services/serviceunits,1,1,0
microsoft.deploymentmanager/steps,1,1,0
microsoft.desktopvirtualization/appattachpackages,1,1,0
microsoft.desktopvirtualization/applicationgroups,1,1,0
microsoft.desktopvirtualization/hostpools,1,1,0
microsoft.desktopvirtualization/scalingplans,1,1,0
microsoft.desktopvirtualization/workspaces,1,1,0
microsoft.devices/elasticpools,0,0,0
microsoft.devices/elasticpools/iothubtenants,0,0,0
microsoft.devices/iothubs,1,1,1
microsoft.devices/provisioningservices,1,1,0
microsoft.devops/controllers,0,0,0
microsoft.devops/pipelines,1,1,0
microsoft.devspaces/controllers,1,1,0
microsoft.devtestlab/labcenters,0,0,0
microsoft.devtestlab/labs,1,0,0
microsoft.devtestlab/labs/environments,1,0,0
microsoft.devtestlab/labs/servicerunners,1,0,0
microsoft.devtestlab/labs/virtualmachines,1,0,0
microsoft.devtestlab/schedules,1,1,0
microsoft.digitaltwins/digitaltwinsinstances,0,0,1
microsoft.documentdb/cassandraclusters,0,0,0
microsoft.documentdb/databaseaccounts,1,1,0
microsoft.documentdb/mongoclusters,0,0,0
microsoft.domainregistration/domains,1,1,0
microsoft.domainregistration/generatessorequest,0,0,0
microsoft.domainregistration/topleveldomains,0,0,0
microsoft.domainregistration/validatedomainregistrationinformation,0,0,0
microsoft.elastic/monitors,0,0,0
microsoft.enterpriseknowledgegraph/services,1,1,0
microsoft.eventgrid/domains,1,1,0
microsoft.eventgrid/eventsubscriptions,0,0,0
microsoft.eventgrid/extensiontopics,0,0,0
microsoft.eventgrid/partnernamespaces,1,1,0
microsoft.eventgrid/partnerregistrations,0,0,0
microsoft.eventgrid/partnertopics,1,1,0
microsoft.eventgrid/systemtopics,1,1,0
microsoft.eventgrid/topics,1,1,0
microsoft.eventgrid/topictypes,0,0,0
microsoft.eventhub/clusters,1,1,0
microsoft.eventhub/namespaces,1,1,1
microsoft.eventhub/sku,0,0,0
microsoft.experimentation/experimentworkspaces,0,0,0
microsoft.extendedlocation/customlocations,0,0,0
microsoft.falcon/namespaces,1,1,0
microsoft.features/featureproviders,0,0,0
microsoft.features/features,0,0,0
microsoft.features/providers,0,0,0
microsoft.features/subscriptionfeatureregistrations,0,0,0
microsoft.genomics/accounts,0,0,0
microsoft.guestconfiguration/automanagedaccounts,0,0,0
microsoft.guestconfiguration/automanagedvmconfigurationprofiles,0,0,0
microsoft.guestconfiguration/guestconfigurationassignments,0,0,0
microsoft.guestconfiguration/software,0,0,0
microsoft.guestconfiguration/softwareupdateprofile,0,0,0
microsoft.guestconfiguration/softwareupdates,0,0,0
microsoft.hanaonazure/hanainstances,0,0,0
microsoft.hanaonazure/sapmonitors,0,0,0
microsoft.hardwaresecuritymodules/dedicatedhsms,0,0,0
microsoft.hdinsight/clusters,1,1,0
microsoft.healthcareapis/services,1,1,0
microsoft.hybridcompute/licenses,1,1,0
microsoft.hybridcompute/machines,1,1,0
microsoft.hybridcompute/machines/extensions,1,1,0
microsoft.hybridcompute/privatelinkscopes,1,1,0
microsoft.hybriddata/datamanagers,1,1,0
microsoft.hybridnetwork/devices,0,0,0
microsoft.hybridnetwork/vnfs,0,0,0
microsoft.hydra/components,0,0,0
microsoft.hydra/networkscopes,0,0,0
microsoft.importexport/jobs,1,1,0
microsoft.insights/accounts,1,1,0
microsoft.insights/actiongroups,1,1,0
microsoft.insights/activitylogalerts,0,0,0
microsoft.insights/alertrules,1,1,0
microsoft.insights/autoscalesettings,1,1,0
microsoft.insights/baseline,0,0,0
microsoft.insights/components,1,1,0
microsoft.insights/datacollectionrules,0,0,0
microsoft.insights/diagnosticsettings,0,0,0
microsoft.insights/diagnosticsettingscategories,0,0,0
microsoft.insights/eventcategories,0,0,0
microsoft.insights/eventtypes,0,0,0
microsoft.insights/extendeddiagnosticsettings,0,0,0
microsoft.insights/guestdiagnosticsettings,0,0,0
microsoft.insights/listmigrationdate,0,0,0
microsoft.insights/logdefinitions,0,0,0
microsoft.insights/logprofiles,0,0,0
microsoft.insights/logs,0,0,0
microsoft.insights/metricalerts,0,0,0
microsoft.insights/metricbaselines,0,0,0
microsoft.insights/metricbatch,0,0,0
microsoft.insights/metricdefinitions,0,0,0
microsoft.insights/metricnamespaces,0,0,0
microsoft.insights/metrics,0,0,0
microsoft.insights/migratealertrules,0,0,0
microsoft.insights/migratetonewpricingmodel,0,0,0
microsoft.insights/myworkbooks,0,0,0
microsoft.insights/notificationgroups,0,0,0
microsoft.insights/privatelinkscopes,0,0,0
microsoft.insights/rollbacktolegacypricingmodel,0,0,0
microsoft.insights/scheduledqueryrules,1,1,0
microsoft.insights/topology,0,0,0
microsoft.insights/transactions,0,0,0
microsoft.insights/vminsightsonboardingstatuses,0,0,0
microsoft.insights/webtests,1,1,0
microsoft.insights/webtests/gettestresultfile,0,0,0
microsoft.insights/workbooks,1,1,0
microsoft.insights/workbooktemplates,1,1,0
microsoft.iotcentral/apptemplates,0,0,0
microsoft.iotcentral/iotapps,1,1,0
microsoft.iothub/iothub,1,1,1
microsoft.iotspaces/graph,1,1,0
microsoft.keyvault/deletedvaults,0,0,0
microsoft.keyvault/hsmpools,0,0,0
microsoft.keyvault/managedhsms,0,0,0
microsoft.keyvault/vaults,1,1,0
microsoft.kubernetes/connectedclusters,0,0,0
microsoft.kubernetes/registeredsubscriptions,0,0,0
microsoft.kubernetesconfiguration/sourcecontrolconfigurations,0,0,0
microsoft.kusto/clusters,1,1,0
microsoft.labservices/labaccounts,0,0,0
microsoft.labservices/users,0,0,0
microsoft.loadtestservice/loadtests,1,1,0
microsoft.locationbasedservices/accounts,0,0,0
microsoft.locationservices/accounts,0,0,0
microsoft.logic/hostingenvironments,0,0,0
microsoft.logic/integrationaccounts,1,1,0
microsoft.logic/integrationserviceenvironments,1,0,0
microsoft.logic/integrationserviceenvironments/managedapis,1,0,0
microsoft.logic/isolatedenvironments,0,0,0
microsoft.logic/workflows,1,1,0
microsoft.machinelearning/commitmentplans,0,0,0
microsoft.machinelearning/webservices,1,0,0
microsoft.machinelearning/workspaces,1,1,0
microsoft.machinelearningcompute/operationalizationclusters,0,0,0
microsoft.machinelearningexperimentation/accounts,0,0,0
microsoft.machinelearningexperimentation/teamaccounts,0,0,0
microsoft.machinelearningmodelmanagement/accounts,0,0,0
microsoft.machinelearningservices/workspaces,0,0,0
microsoft.maintenance/configurationassignments,0,0,0
microsoft.maintenance/maintenanceconfigurations,0,0,0
microsoft.maintenance/updates,0,0,0
microsoft.managedidentity/identities,0,0,0
microsoft.managedidentity/userassignedidentities,0,0,0
microsoft.managednetwork/managednetworks,0,0,0
microsoft.managednetwork/managednetworks/managednetworkgroups,0,0,0
microsoft.managednetwork/managednetworks/managednetworkpeeringpolicies,0,0,0
microsoft.managednetwork/notification,0,0,0
microsoft.managedservices/marketplaceregistrationdefinitions,0,0,0
microsoft.managedservices/registrationassignments,0,0,0
microsoft.managedservices/registrationdefinitions,0,0,0
microsoft.management/getentities,0,0,0
microsoft.management/managementgroups,0,0,0
microsoft.management/managementgroups/settings,0,0,0
microsoft.management/resources,0,0,0
microsoft.management/starttenantbackfill,0,0,0
microsoft.management/tenantbackfillstatus,0,0,0
microsoft.maps/accounts,1,1,0
microsoft.maps/accounts/privateatlases,1,1,0
microsoft.marketplace/offers,0,0,0
microsoft.marketplace/offertypes,0,0,0
microsoft.marketplace/privategalleryitems,0,0,0
microsoft.marketplace/privatestoreclient,0,0,0
microsoft.marketplace/privatestores,0,0,0
microsoft.marketplace/products,0,0,0
microsoft.marketplace/publishers,0,0,0
microsoft.marketplace/register,0,0,0
microsoft.marketplaceapps/classicdevservices,0,0,0
microsoft.marketplaceordering/agreements,0,0,0
microsoft.marketplaceordering/offertypes,0,0,0
microsoft.media/mediaservices,1,1,0
microsoft.media/mediaservices/liveevents,1,1,0
microsoft.media/mediaservices/streamingendpoints,1,1,0
microsoft.microservices4spring/appclusters,0,0,0
microsoft.migrate/assessmentprojects,0,0,0
microsoft.migrate/migrateprojects,0,0,0
microsoft.migrate/movecollections,0,0,0
microsoft.migrate/projects,0,0,0
microsoft.mixedreality/remoterenderingaccounts,1,1,0
microsoft.mobilenetwork/mobilenetworks,0,0,1
microsoft.mobilenetwork/mobilenetworks/datanetworks,0,0,1
microsoft.mobilenetwork/mobilenetworks/simpolicies,0,0,1
microsoft.mobilenetwork/mobilenetworks/sites,0,0,1
microsoft.mobilenetwork/mobilenetworks/slices,0,0,1
microsoft.mobilenetwork/packetcorecontrolplanes,0,0,1
microsoft.mobilenetwork/packetcorecontrolplanes/packetcoredataplanes,0,0,1
microsoft.mobilenetwork/packetcorecontrolplanes/packetcoredataplanes/attacheddatanetworks,0,0,1
microsoft.mobilenetwork/packetcorecontrolplaneversions,0,0,1
microsoft.mobilenetwork/simgroups,0,0,1
microsoft.mobilenetwork/simgroups/sims,0,0,1
microsoft.mobilenetwork/sims,0,0,1
microsoft.netapp/netappaccounts,0,0,0
microsoft.netapp/netappaccounts/capacitypools,0,0,0
microsoft.netapp/netappaccounts/capacitypools/volumes,0,0,0
microsoft.netapp/netappaccounts/capacitypools/volumes/mounttargets,0,0,0
microsoft.netapp/netappaccounts/capacitypools/volumes/snapshots,0,0,0
microsoft.network/applicationgateways,0,0,0
microsoft.network/applicationgatewaywebapplicationfirewallpolicies,0,0,0
microsoft.network/applicationsecuritygroups,1,1,0
microsoft.network/azurefirewalls,0,0,0
microsoft.network/bastionhosts,1,0,0
microsoft.network/bgpservicecommunities,0,0,0
microsoft.network/connections,1,1,0
microsoft.network/ddoscustompolicies,1,1,0
microsoft.network/ddosprotectionplans,0,0,0
microsoft.network/dnszones,1,1,0
microsoft.network/expressroutecircuits,0,0,0
microsoft.network/expressroutegateways,0,0,0
microsoft.network/expressrouteserviceproviders,0,0,0
microsoft.network/firewallpolicies,0,0,0
microsoft.network/ipallocations,1,1,0
microsoft.network/ipgroups,0,0,0
microsoft.network/loadbalancers,1,1,1
microsoft.network/localnetworkgateways,1,1,0
microsoft.network/natgateways,0,0,0
microsoft.network/networkexperimentprofiles,0,0,0
microsoft.network/networkintentpolicies,1,1,0
microsoft.network/networkinterfaces,1,1,1
microsoft.network/networkprofiles,0,0,0
microsoft.network/networksecuritygroups,1,1,1
microsoft.network/networkwatchers,1,0,0
microsoft.network/networkwatchers/connectionmonitors,1,0,0
microsoft.network/networkwatchers/flowlogs,1,0,0
microsoft.network/networkwatchers/pingmeshes,1,0,0
microsoft.network/p2svpngateways,0,0,0
microsoft.network/privatednszones,1,1,0
microsoft.network/privatednszones/virtualnetworklinks,1,1,0
microsoft.network/privatednszonesinternal,0,0,0
microsoft.network/privateendpointredirectmaps,0,0,0
microsoft.network/privateendpoints,1,1,0
microsoft.network/privatelinkservices,0,0,0
microsoft.network/publicipaddresses,1,1,0
microsoft.network/publicipprefixes,1,1,0
microsoft.network/routefilters,0,0,0
microsoft.network/routetables,1,1,0
microsoft.network/securitypartnerproviders,1,1,0
microsoft.network/serviceendpointpolicies,1,1,0
microsoft.network/trafficmanagergeographichierarchies,0,0,0
microsoft.network/trafficmanagerprofiles,1,1,0
microsoft.network/trafficmanagerprofiles/heatmaps,0,0,0
microsoft.network/trafficmanagerusermetricskeys,0,0,0
microsoft.network/virtualhubs,0,0,0
microsoft.network/virtualnetworkgateways,0,0,0
microsoft.network/virtualnetworks,1,1,1
microsoft.network/virtualnetworktaps,0,0,0
microsoft.network/virtualrouters,1,1,0
microsoft.network/virtualwans,0,0,0
microsoft.network/vpnserverconfigurations,0,0,0
microsoft.network/vpnsites,0,0,0
microsoft.notificationhubs/namespaces,1,1,0
microsoft.notificationhubs/namespaces/notificationhubs,1,1,0
microsoft.objectstore/osnamespaces,1,1,0
microsoft.offazure/hypervsites,0,0,0
microsoft.offazure/importsites,0,0,0
microsoft.offazure/mastersites,0,0,0
microsoft.offazure/serversites,0,0,0
microsoft.offazure/vmwaresites,0,0,0
microsoft.operationalinsights/clusters,0,0,0
microsoft.operationalinsights/deletedworkspaces,0,0,0
microsoft.operationalinsights/linktargets,0,0,0
microsoft.operationalinsights/querypacks,0,0,0
microsoft.operationalinsights/storageinsightconfigs,0,0,0
microsoft.operationalinsights/workspaces,1,1,0
microsoft.operationsmanagement/managementassociations,0,0,0
microsoft.operationsmanagement/managementconfigurations,1,1,0
microsoft.operationsmanagement/solutions,1,1,0
microsoft.operationsmanagement/views,1,1,0
microsoft.peering/legacypeerings,0,0,0
microsoft.peering/peerasns,0,0,0
microsoft.peering/peeringlocations,0,0,0
microsoft.peering/peerings,1,1,0
microsoft.peering/peeringservicecountries,0,0,0
microsoft.peering/peeringservicelocations,0,0,0
microsoft.peering/peeringserviceproviders,0,0,0
microsoft.peering/peeringservices,1,1,0
microsoft.policyinsights/policyevents,0,0,0
microsoft.policyinsights/policystates,0,0,0
microsoft.policyinsights/policytrackedresources,0,0,0
microsoft.policyinsights/remediations,0,0,0
microsoft.portal/consoles,0,0,0
microsoft.portal/dashboards,1,1,0
microsoft.portal/usersettings,0,0,0
microsoft.powerbi/workspacecollections,1,1,0
microsoft.powerbidedicated/capacities,1,1,0
microsoft.programmableconnectivity/gateways,0,0,0
microsoft.programmableconnectivity/openapigatewayofferings,0,0,0
microsoft.programmableconnectivity/openapigateways,0,0,0
microsoft.programmableconnectivity/operatorapiconnections,0,0,0
microsoft.programmableconnectivity/operatorapiplans,0,0,0
microsoft.programmableconnectivity/operatorconnections,0,0,0
microsoft.programmableconnectivity/operatorofferings,0,0,0
microsoft.projectbabylon/accounts,0,0,0
microsoft.providerhub/availableaccounts,0,0,0
microsoft.providerhub/providerregistrations,0,0,0
microsoft.providerhub/rollouts,0,0,0
microsoft.purview/accounts,1,1,0
microsoft.quantum/workspaces,0,0,0
microsoft.recoveryservices/replicationeligibilityresults,0,0,0
microsoft.recoveryservices/vaults,1,1,0
microsoft.redhatopenshift/openshiftclusters,0,0,0
microsoft.relay/namespaces,1,1,0
microsoft.resourcegraph/queries,1,1,0
microsoft.resourcegraph/resourcechangedetails,0,0,0
microsoft.resourcegraph/resourcechanges,0,0,0
microsoft.resourcegraph/resources,0,0,0
microsoft.resourcegraph/resourceshistory,0,0,0
microsoft.resourcegraph/subscriptionsstatus,0,0,0
microsoft.resourcehealth/childresources,0,0,0
microsoft.resourcehealth/emergingissues,0,0,0
microsoft.resourcehealth/events,0,0,0
microsoft.resourcehealth/metadata,0,0,0
microsoft.resourcehealth/notifications,0,0,0
microsoft.resources/deployments,0,0,0
microsoft.resources/deploymentscripts,0,0,1
microsoft.resources/deploymentscripts/logs,0,0,0
microsoft.resources/links,0,0,0
microsoft.resources/providers,0,0,0
microsoft.resources/resourcegroups,0,0,0
microsoft.resources/resources,0,0,0
microsoft.resources/subscriptions,0,0,0
microsoft.resources/tags,0,0,0
microsoft.resources/templatespecs,0,0,0
microsoft.resources/templatespecs/versions,0,0,0
microsoft.resources/tenants,0,0,0
microsoft.saas/applications,1,0,0
microsoft.saas/resources,1,1,0
microsoft.saas/saasresources,0,0,0
microsoft.search/resourcehealthmetadata,0,0,0
microsoft.search/searchservices,1,1,0
microsoft.security/adaptivenetworkhardenings,0,0,0
microsoft.security/advancedthreatprotectionsettings,0,0,0
microsoft.security/alerts,0,0,0
microsoft.security/allowedconnections,0,0,0
microsoft.security/applicationwhitelistings,0,0,0
microsoft.security/assessmentmetadata,0,0,0
microsoft.security/assessments,0,0,0
microsoft.security/autodismissalertsrules,0,0,0
microsoft.security/automations,1,1,0
microsoft.security/autoprovisioningsettings,0,0,0
microsoft.security/complianceresults,0,0,0
microsoft.security/compliances,0,0,0
microsoft.security/datacollectionagents,0,0,0
microsoft.security/devicesecuritygroups,0,0,0
microsoft.security/discoveredsecuritysolutions,0,0,0
microsoft.security/externalsecuritysolutions,0,0,0
microsoft.security/informationprotectionpolicies,0,0,0
microsoft.security/iotsecuritysolutions,1,1,0
microsoft.security/iotsecuritysolutions/analyticsmodels,0,0,0
microsoft.security/iotsecuritysolutions/analyticsmodels/aggregatedalerts,0,0,0
microsoft.security/iotsecuritysolutions/analyticsmodels/aggregatedrecommendations,0,0,0
microsoft.security/jitnetworkaccesspolicies,0,0,0
microsoft.security/policies,0,0,0
microsoft.security/pricings,0,0,0
microsoft.security/regulatorycompliancestandards,0,0,0
microsoft.security/regulatorycompliancestandards/regulatorycompliancecontrols,0,0,0
microsoft.security/regulatorycompliancestandards/regulatorycompliancecontrols/regulatorycomplianceassessments,0,0,0
microsoft.security/securitycontacts,0,0,0
microsoft.security/securitysolutions,0,0,0
microsoft.security/securitysolutionsreferencedata,0,0,0
microsoft.security/securitystatuses,0,0,0
microsoft.security/securitystatusessummaries,0,0,0
microsoft.security/servervulnerabilityassessments,0,0,0
microsoft.security/settings,0,0,0
microsoft.security/subassessments,0,0,0
microsoft.security/tasks,0,0,0
microsoft.security/topologies,0,0,0
microsoft.security/workspacesettings,0,0,0
microsoft.securityinsights/aggregations,0,0,0
microsoft.securityinsights/alertrules,0,0,0
microsoft.securityinsights/alertruletemplates,0,0,0
microsoft.securityinsights/automationrules,0,0,0
microsoft.securityinsights/bookmarks,0,0,0
microsoft.securityinsights/cases,0,0,0
microsoft.securityinsights/dataconnectors,0,0,0
microsoft.securityinsights/entities,0,0,0
microsoft.securityinsights/entityqueries,0,0,0
microsoft.securityinsights/incidents,0,0,0
microsoft.securityinsights/officeconsents,0,0,0
microsoft.securityinsights/settings,0,0,0
microsoft.securityinsights/threatintelligence,0,0,0
microsoft.serialconsole/consoleservices,0,0,0
microsoft.servermanagement/gateways,0,0,0
microsoft.servermanagement/nodes,0,0,0
microsoft.servicebus/namespaces,1,1,1
microsoft.servicebus/premiummessagingregions,0,0,0
microsoft.servicebus/sku,0,0,0
microsoft.servicefabric/applications,0,0,0
microsoft.servicefabric/clusters,1,1,0
microsoft.servicefabric/containergroups,0,0,0
microsoft.servicefabric/containergroupsets,0,0,0
microsoft.servicefabric/edgeclusters,0,0,0
microsoft.servicefabric/managedclusters,0,0,0
microsoft.servicefabric/networks,0,0,0
microsoft.servicefabric/secretstores,0,0,0
microsoft.servicefabric/volumes,0,0,0
microsoft.servicefabricmesh/applications,1,1,0
microsoft.servicefabricmesh/containergroups,0,0,0
microsoft.servicefabricmesh/gateways,1,1,0
microsoft.servicefabricmesh/networks,1,1,0
microsoft.servicefabricmesh/secrets,1,1,0
microsoft.servicefabricmesh/volumes,1,1,0
microsoft.servicenetworking/associations,0,0,0
microsoft.servicenetworking/frontends,0,0,0
microsoft.servicenetworking/trafficcontrollers,0,0,0
microsoft.services/rollouts,0,0,0
microsoft.signalrservice/signalr,1,1,0
microsoft.softwareplan/hybridusebenefits,0,0,0
microsoft.solutions/applicationdefinitions,0,0,0
microsoft.solutions/applications,0,0,0
microsoft.solutions/jitrequests,0,0,0
microsoft.sql/instancepools,0,0,0
microsoft.sql/locations,1,1,0
microsoft.sql/managedinstances,0,0,1
microsoft.sql/managedinstances/databases,0,0,1
microsoft.sql/servers,1,1,1
microsoft.sql/servers/databases,1,1,1
microsoft.sql/servers/databases/backuplongtermretentionpolicies,1,1,0
microsoft.sql/servers/elasticpools,1,1,1
microsoft.sql/servers/jobaccounts,1,1,0
microsoft.sql/servers/jobagents,1,1,0
microsoft.sql/virtualclusters,0,0,0
microsoft.sqlvirtualmachine/sqlvirtualmachinegroups,0,0,0
microsoft.sqlvirtualmachine/sqlvirtualmachines,0,0,0
microsoft.storage/storageaccounts,1,1,0
microsoft.storagecache/caches,0,0,0
microsoft.storagesync/storagesyncservices,1,1,0
microsoft.storagesyncdev/storagesyncservices,0,0,0
microsoft.storagesyncint/storagesyncservices,0,0,0
microsoft.storsimple/managers,0,0,0
microsoft.streamanalytics/clusters,0,0,0
microsoft.streamanalytics/streamingjobs,1,1,0
microsoft.streamanalyticsexplorer/environments,0,0,0
microsoft.streamanalyticsexplorer/instances,0,0,0
microsoft.subscription/subscriptions,0,0,0
microsoft.support/services,0,0,0
microsoft.support/supporttickets,0,0,0
microsoft.synapse/workspaces,0,0,0
microsoft.synapse/workspaces/bigdatapools,0,0,0
microsoft.synapse/workspaces/sqlpools,0,0,0
microsoft.timeseriesinsights/environments,1,1,0
microsoft.timeseriesinsights/environments/eventsources,1,1,0
microsoft.timeseriesinsights/environments/referencedatasets,1,1,0
microsoft.token/stores,1,1,0
microsoft.virtualmachineimages/imagetemplates,0,0,0
microsoft.visualstudio/account,0,0,0
microsoft.visualstudio/account/extension,0,0,0
microsoft.visualstudio/account/project,0,0,0
microsoft.vmware/arczones,0,0,0
microsoft.vmware/resourcepools,0,0,0
microsoft.vmware/vcenters,0,0,0
microsoft.vmware/virtualmachines,0,0,0
microsoft.vmware/virtualmachinetemplates,0,0,0
microsoft.vmware/virtualnetworks,0,0,0
microsoft.vmwarecloudsimple/dedicatedcloudnodes,0,0,0
microsoft.vmwarecloudsimple/dedicatedcloudservices,0,0,0
microsoft.vmwarecloudsimple/virtualmachines,0,0,0
microsoft.vnfmanager/devices,0,0,0
microsoft.vnfmanager/vnfs,0,0,0
microsoft.vsonline/accounts,0,0,0
microsoft.vsonline/plans,0,0,0
microsoft.vsonline/registeredsubscriptions,0,0,0
microsoft.web/availablestacks,0,0,0
microsoft.web/billingmeters,0,0,0
microsoft.web/certificates,0,1,0
microsoft.web/connectiongateways,1,1,0
microsoft.web/connections,1,1,0
microsoft.web/customapis,1,1,0
microsoft.web/deletedsites,0,0,0
microsoft.web/deploymentlocations,0,0,0
microsoft.web/georegions,0,0,0
microsoft.web/hostingenvironments,0,0,0
microsoft.web/kubeenvironments,1,1,0
microsoft.web/publishingusers,0,0,0
microsoft.web/recommendations,0,0,0
microsoft.web/resourcehealthmetadata,0,0,0
microsoft.web/runtimes,0,0,0
microsoft.web/serverfarms,1,1,0
microsoft.web/serverfarms/eventgridfilters,0,0,0
microsoft.web/sites,1,1,0
microsoft.web/sites/premieraddons,1,1,0
microsoft.web/sites/slots,1,1,0
microsoft.web/sourcecontrols,0,0,0
microsoft.web/staticsites,1,1,0
microsoft.windowsesu/multipleactivationkeys,0,0,0
microsoft.windowsiot/deviceservices,0,0,0
microsoft.workloadbuilder/workloads,0,0,0
microsoft.workloadmonitor/components,0,0,0
microsoft.workloadmonitor/componentssummary,0,0,0
microsoft.workloadmonitor/monitorinstances,0,0,0
microsoft.workloadmonitor/monitorinstancessummary,0,0,0
microsoft.workloadmonitor/monitors,0,0,0`;

// Parse a CSV string (same format) into a lookup map
function parseMoveCSV(csv) {
  const db = {};
  let invalid = 0;
  csv.split('\n').forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) return;
    const parts = trimmed.split(',');
    if (parts.length >= 4 && parts[0].includes('/')) {
      const rg  = parseInt(parts[1], 10);
      const sub = parseInt(parts[2], 10);
      const reg = parseInt(parts[3], 10);
      db[parts[0].toLowerCase()] = {
        moveRG:     isNaN(rg)  ? 0 : rg,
        moveSub:    isNaN(sub) ? 0 : sub,
        moveRegion: isNaN(reg) ? 0 : reg
      };
    } else {
      invalid++;
    }
  });
  if (invalid > 0 && typeof console !== 'undefined') {
    console.warn(`[move-database] ${invalid} malformed line(s) skipped during CSV parse`);
  }
  return db;
}

// Embedded fallback database (used when offline or fetch fails)
let MOVE_DB = parseMoveCSV(MOVE_DB_RAW);

// ==========================================================
// Move Notes / Dependency Database
// Maps resource types (lowercase) to i18n keys describing
// migration dependencies, constraints, and guidance.
// Source: Microsoft official documentation
// ==========================================================
const MOVE_NOTES = {
  // SQL
  'microsoft.sql/servers':                          'noteSqlServer',
  'microsoft.sql/servers/databases':                'noteSqlDb',
  'microsoft.sql/servers/elasticpools':             'noteSqlElasticPool',
  'microsoft.sql/servers/jobaccounts':              'noteSqlChild',
  'microsoft.sql/servers/jobagents':                'noteSqlChild',
  'microsoft.sql/servers/databases/backuplongtermretentionpolicies': 'noteSqlChild',
  'microsoft.sql/managedinstances':                 'noteSqlManagedInst',
  'microsoft.sql/managedinstances/databases':       'noteSqlChild',
  // Compute / VMs
  'microsoft.compute/virtualmachines':              'noteVm',
  'microsoft.compute/disks':                        'noteDisk',
  'microsoft.compute/virtualmachines/extensions':   'noteVmExt',
  'microsoft.compute/availabilitysets':             'noteAvailSet',
  'microsoft.compute/snapshots':                    'noteSnapshot',
  'microsoft.compute/virtualmachinescalesets':      'noteVmss',
  // Network
  'microsoft.network/networkinterfaces':            'noteNic',
  'microsoft.network/publicipaddresses':            'notePublicIp',
  'microsoft.network/loadbalancers':                'noteLoadBalancer',
  'microsoft.network/networksecuritygroups':        'noteNsg',
  'microsoft.network/virtualnetworks':              'noteVnet',
  'microsoft.network/applicationgateways':          'noteAppGw',
  // App Service
  'microsoft.web/sites':                            'noteAppService',
  'microsoft.web/serverfarms':                      'noteAppPlan',
  'microsoft.web/certificates':                     'noteCert',
  'microsoft.certificateregistration/certificateorders': 'noteAppService',
  'microsoft.domainregistration/domains':           'noteAppService',
  // Data
  'microsoft.documentdb/databaseaccounts':          'noteCosmosDb',
  'microsoft.dbformysql/servers':                   'noteDbReplica',
  'microsoft.dbforpostgresql/servers':              'noteDbReplica',
  'microsoft.dbformariadb/servers':                 'noteDbReplica',
  // Containers
  'microsoft.containerregistry/registries':         'noteContainerReg',
  // HDInsight
  'microsoft.hdinsight/clusters':                   'noteHdInsight',
  // Monitoring / Automation
  'microsoft.operationalinsights/workspaces':       'noteLogAnalytics',
  'microsoft.automation/automationaccounts':        'noteAutomation',
  'microsoft.automation/automationaccounts/runbooks':       'noteAutomationRunbook',
  'microsoft.automation/automationaccounts/configurations': 'noteAutomationChild',
  'microsoft.insights/components':                  'noteAppInsights',
  // Cache / KeyVault
  'microsoft.cache/redis':                          'noteRedis',
  'microsoft.keyvault/vaults':                      'noteKeyVault',
  // Event Grid
  'microsoft.eventgrid/eventsubscriptions':         'noteEventGridSub',
  // API Management
  'microsoft.apimanagement/service':                'noteApiMgmt',
  // Recovery Services
  'microsoft.recoveryservices/vaults':              'noteRecovery',
  // Stream Analytics
  'microsoft.streamanalytics/streamingjobs':        'noteStreamAnalytics',
};

// ==========================================================
// Friendly Names Map
// Maps common Azure resource type prefixes to human-readable
// names for non-technical users (tooltips / PDF reports).
// ==========================================================
const FRIENDLY_NAMES = {
  'microsoft.compute/virtualmachines':              'Virtual Machine (VM)',
  'microsoft.compute/virtualmachines/extensions':   'VM Extension',
  'microsoft.compute/disks':                        'Managed Disk',
  'microsoft.compute/snapshots':                    'Disk Snapshot',
  'microsoft.compute/availabilitysets':             'Availability Set',
  'microsoft.compute/virtualmachinescalesets':      'VM Scale Set (VMSS)',
  'microsoft.compute/images':                       'VM Image',
  'microsoft.compute/galleries':                    'Compute Gallery',
  'microsoft.compute/proximityplacementgroups':     'Proximity Placement Group',
  'microsoft.network/virtualnetworks':              'Virtual Network (VNet)',
  'microsoft.network/networksecuritygroups':        'Network Security Group (NSG)',
  'microsoft.network/networkinterfaces':            'Network Interface (NIC)',
  'microsoft.network/publicipaddresses':            'Public IP Address',
  'microsoft.network/loadbalancers':                'Load Balancer',
  'microsoft.network/applicationgateways':          'Application Gateway',
  'microsoft.network/privatednszones':              'Private DNS Zone',
  'microsoft.network/dnszones':                     'DNS Zone',
  'microsoft.network/frontdoors':                   'Front Door',
  'microsoft.network/routetables':                  'Route Table',
  'microsoft.network/bastionhosts':                 'Azure Bastion',
  'microsoft.network/natgateways':                  'NAT Gateway',
  'microsoft.network/firewallpolicies':             'Firewall Policy',
  'microsoft.network/azurefirewalls':               'Azure Firewall',
  'microsoft.network/vpngateways':                  'VPN Gateway',
  'microsoft.network/expressroutecircuits':         'ExpressRoute Circuit',
  'microsoft.network/privateendpoints':             'Private Endpoint',
  'microsoft.network/privatelinkservices':          'Private Link Service',
  'microsoft.network/trafficmanagerprofiles':       'Traffic Manager Profile',
  'microsoft.storage/storageaccounts':              'Storage Account',
  'microsoft.sql/servers':                          'SQL Server',
  'microsoft.sql/servers/databases':                'SQL Database',
  'microsoft.sql/servers/elasticpools':             'SQL Elastic Pool',
  'microsoft.sql/managedinstances':                 'SQL Managed Instance',
  'microsoft.web/sites':                            'App Service / Web App',
  'microsoft.web/serverfarms':                      'App Service Plan',
  'microsoft.web/certificates':                     'App Service Certificate',
  'microsoft.web/staticsites':                      'Static Web App',
  'microsoft.containerservice/managedclusters':     'AKS Cluster',
  'microsoft.containerregistry/registries':         'Container Registry (ACR)',
  'microsoft.containerinstance/containergroups':    'Container Instance',
  'microsoft.keyvault/vaults':                      'Key Vault',
  'microsoft.documentdb/databaseaccounts':          'Cosmos DB Account',
  'microsoft.cache/redis':                          'Azure Cache for Redis',
  'microsoft.insights/components':                  'Application Insights',
  'microsoft.operationalinsights/workspaces':       'Log Analytics Workspace',
  'microsoft.automation/automationaccounts':        'Automation Account',
  'microsoft.automation/automationaccounts/runbooks': 'Automation Runbook',
  'microsoft.logic/workflows':                      'Logic App',
  'microsoft.apimanagement/service':                'API Management',
  'microsoft.eventgrid/topics':                     'Event Grid Topic',
  'microsoft.eventgrid/eventsubscriptions':         'Event Grid Subscription',
  'microsoft.eventhub/namespaces':                  'Event Hub Namespace',
  'microsoft.servicebus/namespaces':                'Service Bus Namespace',
  'microsoft.devices/iothubs':                      'IoT Hub',
  'microsoft.cognitiveservices/accounts':           'Cognitive Services',
  'microsoft.machinelearningservices/workspaces':   'Machine Learning Workspace',
  'microsoft.recoveryservices/vaults':              'Recovery Services Vault',
  'microsoft.databricks/workspaces':                'Databricks Workspace',
  'microsoft.datafactory/factories':                'Data Factory',
  'microsoft.synapse/workspaces':                   'Synapse Workspace',
  'microsoft.dbformysql/servers':                   'Azure Database for MySQL',
  'microsoft.dbforpostgresql/servers':              'Azure Database for PostgreSQL',
  'microsoft.dbformariadb/servers':                 'Azure Database for MariaDB',
  'microsoft.dbformysql/flexibleservers':           'MySQL Flexible Server',
  'microsoft.dbforpostgresql/flexibleservers':      'PostgreSQL Flexible Server',
  'microsoft.hdinsight/clusters':                   'HDInsight Cluster',
  'microsoft.streamanalytics/streamingjobs':        'Stream Analytics Job',
  'microsoft.search/searchservices':                'Azure AI Search',
  'microsoft.signalrservice/signalr':               'Azure SignalR Service',
  'microsoft.maps/accounts':                        'Azure Maps Account',
  'microsoft.notificationhubs/namespaces':          'Notification Hub Namespace',
  'microsoft.cdn/profiles':                         'CDN Profile',
  'microsoft.media/mediaservices':                  'Media Services',
  'microsoft.batch/batchaccounts':                  'Batch Account',
  'microsoft.managedidentity/userassignedidentities': 'Managed Identity',
  'microsoft.portal/dashboards':                    'Azure Dashboard',
  'microsoft.app/containerapps':                    'Container App',
  'microsoft.app/managedenvironments':              'Container Apps Environment',
  'microsoft.resources/resourcegroups':             'Resource Group',
  'microsoft.authorization/roleassignments':        'Role Assignment',
  'microsoft.authorization/roledefinitions':        'Role Definition',
  'microsoft.monitor/accounts':                     'Azure Monitor Account',
  'microsoft.alertsmanagement/smartdetectoralertrules': 'Smart Detection Rule',
  'microsoft.aad/domainservices':                   'Azure AD Domain Services',
  'microsoft.network/applicationsecuritygroups':    'Application Security Group',
  'microsoft.certificateregistration/certificateorders': 'Certificate Order',
  'microsoft.domainregistration/domains':           'App Service Domain',
};
