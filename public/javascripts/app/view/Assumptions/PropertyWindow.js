
//------------------------------------------------------------------------------
Ext.define('MyApp.view.Assumptions.PropertyWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.propertywindow',

    requires: [
        'MyApp.view.Assumptions.PropertyContainer'
    ],

    height: 503,
    width: 300,
    closable: false,
    title: 'Global Assumptions',

	dockedItems: [{
		xtype: 'toolbar',
		dock: 'bottom',
		items: [{
			xtype: 'button',
			icon: 'app/images/new_icon.png',
			scale: 'medium',
			text: 'Restore Defaults',
			handler: function(self) {
				var win = self.up(). 	// go up to toolbar level (from the button level)
								up();	// go up to the window level that the toolbar is in

				// MAKE a COPY vs just setting the pointers, which does nothing to make a copy
				//	like we really need...
				Ext.suspendLayouts();
				DSS_AssumptionsAdjustable = JSON.parse(JSON.stringify(DSS_AssumptionsDefaults));
				win.getComponent('DSS_AssumptionCategories').removeAll(true); // destroy everything in it...
				win.populateAssumptions(DSS_AssumptionsAdjustable.Assumptions);
				Ext.resumeLayouts(true);
			}
		},
		{
			xtype: 'tbspacer', 
			width: 7
		},
		{
			xtype: 'button',
			icon: 'app/images/save_icon.png',
			scale: 'medium',
			text: 'Save & Exit',
			handler: function(self) {
				// TODO: scrape settings out
				self.up(). 	// go up to toolbar level (from the button level)
					up().	// go up to the window level that the toolbar is in
					doClose(); 
			}
		},
		{
			xtype: 'button',
			icon: 'app/images/go_icon.png',
			scale: 'medium',
			text: 'Exit',
			handler: function(self) {
				self.up(). 	// go up to toolbar level (from the button level)
					up().	// go up to the window level that the toolbar is in
					doClose(); 
			}
		}]
	}],
 
    //--------------------------------------------------------------------------
    initComponent: function() {
        var me = this;

        Ext.applyIf(me, {
            items: [{
            	itemId: 'DSS_AssumptionCategories',
				xtype: 'panel',
				autoScroll: true,
				layout: {
					type: 'accordion',
					animate: false,
					multi: true,
					titleCollapse: false
				},
				items: [{
					xtype: 'panel',
					hidden: true
				}]
			}]
        });

        me.callParent(arguments);
        
        if (DSS_AssumptionsAdjustable && DSS_AssumptionsAdjustable.Assumptions) {
        	Ext.suspendLayouts();
        	this.populateAssumptions(DSS_AssumptionsAdjustable.Assumptions);
        	Ext.resumeLayouts(true);
       }
    },
    
    // Each array element should have these fields....
	//	node.put("Category", category);
	//	node.put("Icon", icon);
	//	node.put("VariableName", variableName);
	//	node.put("DisplayName", displayName);
	//	node.put("DefaultValue", defaultValue);
    //--------------------------------------------------------------------------
    populateAssumptions: function(assumptionsArray) {
    	
		// first find unique categories....
        var categories = {};
		for (var idx = 0; idx < assumptionsArray.length; idx++) {
			categories[assumptionsArray[idx].Category] = assumptionsArray[idx].Icon; 
		}
        
        // create panels for each unique category...
        var categoryPanels = {};
        for (var property in categories) {
        	var panel = Ext.create('MyApp.view.Assumptions.PropertyContainer', {
        		title: property,
				icon: 'app/images/' + categories[property]
        	});
        	categoryPanels[property] = panel;
        	this.getComponent('DSS_AssumptionCategories').add(panel);
        }
        
        // Now finally push the variables into the correct panel....
		for (var idx = 0; idx < assumptionsArray.length; idx++) {
        	categoryPanels[assumptionsArray[idx].Category].addAssumptionElement(assumptionsArray[idx]);
        }
    }

});

