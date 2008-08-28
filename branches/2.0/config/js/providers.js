/*
* Javascript functions for Managing Service Providers in AsteriskGUI
*
* Replace this page with your custom service providers script
*
*/

var whenThisFileisLoaded = function(){
	parent.ASTGUI.dialog.hide();
	DOM_table_SPS_list = _$('table_SPS_list');
        ASTGUI.domActions.clear_table(DOM_table_SPS_list);
        var newRow = DOM_table_SPS_list.insertRow(-1);
	ASTGUI.domActions.tr_addCell( newRow , { html: "No Providers listed in Providers.js" } );
}

loaded_external = true; // this should be the last line in the code, tells the page (that loaded this script) that the script has been loaded
