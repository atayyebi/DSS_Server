/*
 * File: app.js
 *
 * This file was generated by Sencha Architect version 2.1.0.
 * http://www.sencha.com/products/architect/
 *
 * This file requires use of the Ext JS 4.1.x library, under independent license.
 * License of Sencha Architect does not include license for Ext JS 4.1.x. For more
 * details see http://www.sencha.com/license or contact license@sencha.com.
 *
 * This file will be auto-generated each and everytime you save your project.
 *
 * Do NOT hand edit this file.
 */

Ext.Loader.setConfig({
    enabled: true,
		paths: {
			GeoExt: "http://geoext.github.com/geoext2/src/GeoExt",
			Ext: "http://cdn.sencha.io/ext-4.1.1-gpl/src"
		}
});

Ext.application({
    stores: [
        'store1',
        'landCoverTypes',
        'selectionModification',
        'selectionTool'
    ],
    views: [
        'InfoToolbar',
        'MainViewport',
        'SelectionTools',
        'TransformationTools',
        'ManagementTools',
        'EvaluationTools',
        'GraphTools'
    ],
    autoCreateViewport: true,
    name: 'MyApp'
});
