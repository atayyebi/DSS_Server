
// Values used by this WIDGET object - should be provided on the configured object...    
// DSS_Label - the label for the value field
// DSS_UnitLabel - the label that describes what units the value field are in
// DSS_GraphTitle - the title for the popup graph window
// DSS_GraphData - the server passed JSON that contains the data bins for the graphes
// DSS_FieldString - the name passed to the server heatmap function, spider graphs, etc.

//------------------------------------------------------------------------------
Ext.define('MyApp.view.Report_DetailElement', {
    extend: 'Ext.container.Container',
    alias: 'widget.report_detail_item',

    requires : [
    	'MyApp.view.Report_GraphPopUp'
    ],
    
    width: 500,
    height: 28,
	layout: {
        type: 'absolute'
    },

    //--------------------------------------------------------------------------
    initComponent: function() {
        var me = this;
	
        // set's this as the default, ie, where is the data source? Delta? File1? File2?
        this.DSS_FieldDataType = 'delta'; 
        // set's this as the default, ie, how is the value displayed? Absolute? %?
        this.DSS_FieldValueType = 'absolute';
        
        Ext.applyIf(me, {
            items: [
            {
			    itemId: 'value_field',  
			    xtype: 'textfield',
			    x: 0,
			    y: 5,
			    width: 240,
			    fieldLabel: me.DSS_Label,
			    labelWidth: 100,
			    labelAlign: 'right'
			},{
				xtype: 'label',
				x: 245,
				y: 9,
				text: me.DSS_UnitLabel ? me.DSS_UnitLabel : " ",
				style: {
					color: '#888'
				}
			},{
			    itemId: 'graph_button',
			    xtype: 'button',
			    x: 305,
			    y: 5,
			    width: 60,
			    text: 'Graph',
			    tooltip: {
			    	text: 'View a histogram graph of the two result sets',
			    	showDelay: 100
			    },
			    handler: function (self) {
					var mypopup = Ext.create("MyApp.view.Report_GraphPopUp", {title: me.DSS_GraphTitle});
					mypopup.show();
					mypopup.SetChartData(me.DSS_GraphData);
			    }
			},{
			    itemId: 'heat_delta_button',
			    xtype: 'button',
			    x: 375,
			    y: 5,
			    width: 60,
			    enableToggle: true,
			    text: 'Map',
			    tooltip: {
			    	text: 'View a data / heatmap overlay calculated from the data sets',
			    	showDelay: 100
			    },
			    handler: function(self) {
			    	me.showHeatmap(self, me.DSS_FieldDataType);
			    }
			},{
			    itemId: 'information_button',
			    xtype: 'button',
			    x: 445,
			    y: 5,
			    width: 30,
			    text: '?',
			    tooltip: {
			    	text: 'View information about this model result',
			    	showDelay: 100
			    },
			    handler: function(self) {
			    	
			    }
			}
	    ]});
        
        me.callParent(arguments);
    },

    //--------------------------------------------------------------------------
	clearFields: function() {
		
		this.getComponent('value_field').setValue(null);
	},
	
    //--------------------------------------------------------------------------
	setWait: function() {
		var spinnerStyle = {"background-image":"url(app/images/spinner_16a.gif)",
			"background-repeat":"no-repeat","background-position":"center center", 
			"padding-left":"16px"};
		
		this.getComponent('value_field').setFieldStyle(spinnerStyle);
		this.getComponent('graph_button').disable();
		this.getComponent('heat_delta_button').disable();
//		this.getComponent('heat_file1_button').disable();
//		this.getComponent('heat_file2_button').disable();
	},
	
    //--------------------------------------------------------------------------
	clearWait: function() {
		
		var clearSpinnerStyle = {"background-image":"none"};

		this.getComponent('value_field').setFieldStyle(clearSpinnerStyle);
		this.getComponent('graph_button').enable();
		this.getComponent('heat_delta_button').enable();
//		this.getComponent('heat_file1_button').enable();
//		this.getComponent('heat_file2_button').enable();
	},
	
    //--------------------------------------------------------------------------
	createHeatmapLegend: function(serverData) {
		
		var legendContainer = Ext.getCmp('DSS_heatmap_legend');
		
		// suspend layout while we make the changes otherwise EACH minor change
		//	will cause a layout recalc which slows everything down. Do it all at once!
		Ext.suspendLayouts();
		
		// remove everything and then add all new color/widget elements back...
		legendContainer.removeAll();
		
		for (var idx = 0; idx < serverData.palette.length; idx++) {
			var element = Ext.create('MyApp.view.Legend_HeatmapColor', {	
						DSS_ElementColor: serverData.palette[idx],
						DSS_ElementValue: serverData.values[idx]}
			);
			
			legendContainer.add(element);
		}
		// Layouts were disabled...must turn them back on!!
		Ext.resumeLayouts(true);
	},
	
	// type can be: 
	//	delta - shows change between file1 and file2
	//	file1 - shows file1 as an absolute map
	//	file2 - shows file2 as an absolute map
    //--------------------------------------------------------------------------
    showHeatmap: function(button, type) {

    	var me = this;
    	
		if (button.DSS_Layer) { 
			globalMap.removeLayer(button.DSS_Layer);
			button.DSS_Layer = null;
		}
		else {
			var obj = Ext.Ajax.request({
				url: location.href + 'getHeatmap',
				jsonData: {
					'model': me.DSS_FieldString,
					'type': type
				},
				timeout: 10 * 60 * 1000, // minutes * seconds * (i.e. converted to) milliseconds
				
				success: function(response, opts) {
					
					var obj= JSON.parse(response.responseText);
					console.log("success: ");
					console.log(obj);
					
					// Send server data for colors/values to the legend creation code...
					me.createHeatmapLegend(obj);
					
					Ext.defer(function(obj) {		
						var bounds = new OpenLayers.Bounds(
							-10062652.65061, 5278060.469521415,
							-9878152.65061, 5415259.640662575
						);
						var imgTest = new OpenLayers.Layer.Image(
							button.DSS_heatString,
							'app/file/' + obj.heatFile,
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
						
						if (button.DSS_Layer) { 
							globalMap.removeLayer(button.DSS_Layer);
						}
						button.DSS_Layer = imgTest;
						globalMap.addLayer(button.DSS_Layer);
						button.DSS_Layer.setOpacity(0.9);
					}, 1000, this, [obj]);
				},
				
				failure: function(respose, opts) {
					alert("heatmap request failed, request timed out?");
				}
			});
		}
    },
    
    //--------------------------------------------------------------------------
    setValueField: function() {
    	
    	if (!this.DSS_FieldData) {
    		return;
    	}
    	
    	var res = null;
    	if (this.DSS_FieldDataType == 'file1') {
    		res = this.DSS_FieldData.val1; // NOTE: set up in setData
    	}
    	else if (this.DSS_FieldDataType == 'file2') {
    		res = this.DSS_FieldData.val2; // NOTE: set up in setData
    	}
    	else { // type is 'delta'
			if (this.DSS_FieldValueType == 'absolute') {
				res = this.DSS_FieldData.total; // NOTE: set up in setData
			}
			else { // type is '%'
				// TODO: bring in or calc the right values....
				// HELP ME AMIN!!!!
				res = 1234; // << replace, just making sure the UI code works...
			}
    	}
    	
		this.getComponent('value_field').setValue(res.toFixed(4));
    },
  
    // valid style types: 'file1', 'file2', 'delta'
    //--------------------------------------------------------------------------
    changeDataStyleType: function(newType) {
    	
    	this.DSS_FieldDataType = newType;
    	this.setValueField();
    },
    
    // valid style types: 'absolute', '%'
    //--------------------------------------------------------------------------
	changeValueStyleType: function(newType) {
		
		this.DSS_FieldValueType = newType;
    	this.setValueField();
    },

    //--------------------------------------------------------------------------
	// OBJ Data comes in with this format
	// obj.*model_name*	// where model name is something like 'habitat_index', 'soc', 'nitrogen', etc.
	//		.file1		// right now, Default, but could be any model run when arbitrary model compares are supported
	//			.sum
	//			.count
	//			.min
	//			.max
	//		.file2		// right now, Transform, but could be any model run later...
	//			.sum
	//			.count
	//			.min
	//			.max
    //--------------------------------------------------------------------------
    setData: function(val1, val2, totalVal, data) // send in something like: obj.habitat_index
    {
    	this.DSS_FieldData = {val1: val1, val2: val2, total: totalVal};
    	
		this.clearWait();
		Ext.getCmp('DSS_SpiderGraphPanel').setSpiderDataElement(val1, val2, this.DSS_FieldString);
		this.setValueField();
		this.DSS_GraphData = data;
    }

});

