
// Toolbar for View / Selection panel

var DSS_DoExpandQueried = true;

//------------------------------------------------------------------------------
Ext.define('MyApp.view.ViewSelectToolbar', {
		
    extend: 'Ext.toolbar.Toolbar',
    alias: 'widget.view_select_toolbar',

	style: {
    	'background-color': '#ADC5B5'
    },

    //--------------------------------------------------------------------------
    initComponent: function() {
        var me = this;

        Ext.applyIf(me, {
			items: [
			{	
				xtype: 'button',
				scale: 'small',
				text: 'Expand Queried',
				enableToggle: true,
				pressed: DSS_DoExpandQueried,
				tooltip: {
					text: 'Expand only queried layers',
					showDelay: 100
				},
				border: 1,
				handler: function(button) {
					DSS_DoExpandQueried = button.pressed;
					if (DSS_DoExpandQueried) {
						button.up().tryExpandQueried();
					}
				}
			},
			{	
				xtype: 'button',
				scale: 'small',
				text: 'Expand All',
				tooltip: {
					text: 'Expand all query groups',
					showDelay: 100
				},
				border: 1,
				handler: function(button) {
					button.up().tryExpandAll();
				}
			},
			{	
				xtype: 'button',
				scale: 'small',
				text: 'Collapse',
				tooltip: {
					text: 'Collapse all query groups',
					showDelay: 100
				},
				border: 1,
				handler: function(button) {
					button.up().tryCollapseAll();
				}
			},
			{
				xtype: 'tbspacer', 
				width: 84
			},
			{
				xtype: 'button',
				itemId: 'DSS_queryButton',
				scale: 'small',
				text: 'Run Query',
				icon: 'app/images/go_icon_small.png',
				tooltip: {
					text: 'Run the current query and show selection results',
					showDelay: 100
				},
				border: 1,
				handler: function(button, evt, toolEl, owner, tool) {
					button.up().buildQuery();
				}
			}/*,
			{
				xtype: 'button',
				itemId: 'DSS_modelButton',
				scale: 'small',
				text: 'Run Model',
				iconAlign: 'right',
				tooltip: {
					text: 'Run the Model using the current query',
					showDelay: 100
				},
				border: 1,
				handler: function(button, evt, toolEl, owner, tool) {
					button.up().buildModel();
				}
			},
			{
				xtype: 'button',
				scale: 'small',
				text: '!!',
				iconAlign: 'right',
				tooltip: {
					text: 'Test resetting query elements',
					showDelay: 100
				},
				border: 1,
				handler: function(button, evt, toolEl, owner, tool) {
					button.up().resetQuery();
				}
			}*/]
        });

        me.callParent(arguments);
    },

    //--------------------------------------------------------------------------
    buildQuery: function() {
    	
       	var requestData = {
    		clientID: 12345, //temp
    		queryLayers: []
    	};

    	var query = false;
    	for (var i = 0; i < DSS_globalQueryableLayers.length; i++) {
    		
    		if (DSS_globalQueryableLayers[i].includeInQuery()) {
    			var queryComp = DSS_globalQueryableLayers[i].getSelectionCriteria();
    			requestData.queryLayers.push(queryComp);
    			query = true;
    		}
    	}
    	
		console.log(requestData);
		if (query) {
			this.submitQuery(requestData);
			this.testStoreQuery = requestData;
		}
		else {
			alert("No query built - nothing to query");
		}
    },
    
    //--------------------------------------------------------------------------
    submitQuery: function(queryJson) {
    	
		var button = this.getComponent('DSS_queryButton');
		button.setIcon('app/images/spinner_16a.gif');
		button.setDisabled(true);

		var obj = Ext.Ajax.request({
			url: location.href + 'query',
			jsonData: queryJson,
			timeout: 15000, // in milliseconds
			
			success: function(response, opts) {
				
				var obj = JSON.parse(response.responseText);
				console.log("success: ");
				console.log(obj);
				
				// TODO: not 100% sure a delay is needed here? Was added to give server
				//	time to finish writing out file...but if the OK response comes back from the server
				//	...that is AFTER the file write process so the file should be ready?
				// Still, sometimes the file fails to be found if we request the image too fast...
				//	as if the server is still finishing writing it out?
				Ext.defer(function(response) {
					// FIXME: bounds should probably be computed by the server and passed back!!!
					var bounds = new OpenLayers.Bounds(
						-10062652.65061, 5278060.469521415,
						-9878152.65061, 5415259.640662575
					);
					var imgTest = new OpenLayers.Layer.Image(
						'Selection',
						obj.url,
						bounds,
						new OpenLayers.Size(2113.0,-2113.0),
						{
							buffer: 0,
							opacity: 1.0,
							isBaseLayer: false,
							displayInLayerSwitcher: false,
							transitionEffect: "resize",
							visibility: true,
							maxResolution: "auto",
							projection: globalMap.getProjectionObject(),
							numZoomLevels: 19
						}
					);
					
					var selectionPanel = Ext.getCmp('CurrentSelectionLayer');
					selectionPanel.setSelectionLayer(imgTest)
					selectionPanel.setNumSelectedPixels(obj.selectedPixels, obj.totalPixels);
			
					var summaryPanel = Ext.getCmp('DSS_ScenarioSummary');
					summaryPanel.expand(true);
					
					button.setIcon('app/images/go_icon_small.png');
					button.setDisabled(false);
					
				}, 1000, this, [response]);
	
			},
			
			failure: function(respose, opts) {
				button.setIcon('app/images/go_icon_small.png');
				button.setDisabled(false);
				alert("Query failed, request timed out?");
			}
		});
	},
	
	//--------------------------------------------------------------------------
	buildModel: function() {
	
		var requestData = {
			clientID: 12345, //temp
			transforms: []
		};
		
		var transform = {
			queryLayers: [],
			newLandUse: 1
		};
		
		var haveQuery = false;
		for (var i = 0; i < DSS_globalQueryableLayers.length; i++) {
			
			if (DSS_globalQueryableLayers[i].includeInQuery()) {
				var queryComp = DSS_globalQueryableLayers[i].getSelectionCriteria();
				transform.queryLayers.push(queryComp);
				haveQuery = true;
			}
		}
	
		requestData.transforms.push(transform);
		
		console.log(requestData);
		if (haveQuery) {
			this.submitModel(requestData);
		}
		else {
			alert("No query built - nothing to query");
		}
	},
	
    //--------------------------------------------------------------------------
    submitModel: function(queryJson) {
    	
		var button = this.getComponent('DSS_modelButton');
		button.setIcon('app/images/spinner_16a.gif');
		button.setDisabled(true);

		var obj = Ext.Ajax.request({
			url: location.href + 'models',
			jsonData: queryJson,
			timeout: 15000000, // in milliseconds
			
			success: function(response, opts) {
				
				var obj = JSON.parse(response.responseText);
				console.log("success: ");
				console.log(obj);
				
				Ext.getCmp('Model_Graph').SetData(obj);
				button.setIcon(null);
				button.setDisabled(false);
			},
			
			failure: function(respose, opts) {
				button.setIcon(null);
				button.setDisabled(false);
				alert("Model run failed, request timed out?");
			}
		});
	},

	//--------------------------------------------------------------------------
	tryExpandAll: function() {
		
		// NOTE: Each layer expand causes a layout calculation...much more efficient
		//	to disable the layout engine, make all of the changes, then do the final layout...
		Ext.suspendLayouts();
    	for (var i = 0; i < DSS_globalQueryableLayers.length; i++) {
    		
    		var layer = DSS_globalQueryableLayers[i];
			layer.expand();
		}
		Ext.resumeLayouts(true);
	},
	
	//--------------------------------------------------------------------------
	tryExpandQueried: function() {
		
		// NOTE: Each layer expand causes a layout calculation...much more efficient
		//	to disable the layout engine, make all of the changes, then do the final layout...
		Ext.suspendLayouts();
    	for (var i = 0; i < DSS_globalQueryableLayers.length; i++) {
    		
    		var layer = DSS_globalQueryableLayers[i];
    		if (layer.includeInQuery()) {
    			layer.expand();
    		}
    		else {
    			layer.collapse();
    		}
		}
		Ext.resumeLayouts(true);
	},
	
	//--------------------------------------------------------------------------
	tryCollapseAll: function() {
		
		// NOTE: Each layer expand causes a layout calculation...much more efficient
		//	to disable the layout engine, make all of the changes, then do the final layout...
		Ext.suspendLayouts();
    	for (var i = 0; i < DSS_globalCollapsibleLayers.length; i++) {
    		
    		var layer = DSS_globalCollapsibleLayers[i];
    		if (layer.DSS_noCollapseTool == false) {
    			layer.collapse();
    		}
		}
		Ext.resumeLayouts(true);
	},

	//--------------------------------------------------------------------------
	resetQuery: function() {
		
    	for (var i = 0; i < DSS_globalQueryableLayers.length; i++) {
    		
    		DSS_globalQueryableLayers[i].setSelectionCriteria(this.testStoreQuery);
    	}
    }

});

