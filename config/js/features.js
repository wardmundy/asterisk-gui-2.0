/*
 * Asterisk-GUI	- an Asterisk configuration interface
 *
 * features.html functions
 *
 * Copyright (C) 2006-2008, Digium, Inc.
 *
 * Pari Nannapaneni <pari@digium.com>
 *
 * See http://www.asterisk.org for more information about
 * the Asterisk project. Please do not directly contact
 * any of the maintainers of this project for assistance;
 * the project provides a web site, mailing lists and IRC
 * channels for your use.
 *
 * This program is free software, distributed under the terms of
 * the GNU General Public License Version 2. See the LICENSE file
 * at the top of the source tree.
 *
 */
var ct = 'general';
var FM = 'featuremap';
var AP_MAP_TRID = 'TR_APMAP_';
var ENABLED_APPS = [];

var ApplicationMap = {};
var APPS_LIST = [ "Answer", "Background", "Busy", "Congestion", "DigitTimeout", "DISA", "ResponseTimeout", "Playback" , "UserEvent" , "Wait", "WaitExten", "Hangup" ];

var do_new_ApplicationMap_row = function(){
	var TBL = _$('Table_applicationMap_definitions');
	create_new_AppMap_tr('');
};

var create_new_AppMap_tr = function( featureName){
	if(featureName){
		var tmp_fields = ApplicationMap[featureName].split(',') ;
	}else{
		featureName = '';
		var tmp_fields = [ '','self', '' , ''] ;
	}

	var TBL = _$('Table_applicationMap_definitions');

	if( !TBL.rows.length || (TBL.rows.length && TBL.rows[0].className == 'noapps') ){
		ASTGUI.domActions.removeAllChilds(TBL);
		var addCell = ASTGUI.domActions.tr_addCell;
		var newRow = TBL.insertRow(-1);
		newRow.className = "frow";
		addCell( newRow , { html:'Enabled' } );
		addCell( newRow , { html:'Feature Name'} );
		addCell( newRow , { html:'Digits'} );
		addCell( newRow , { html:'ActiveOn/By'} );
		addCell( newRow , { html:'App Name'} );
		addCell( newRow , { html:'Arguments'} );
		addCell( newRow , { html:''} );
	}

	var newRow = TBL.insertRow(-1);
	newRow.className = ((TBL.rows.length)%2==1)?'odd':'even';
	newRow.id = AP_MAP_TRID + String(  Math.round(10000 * Math.random())  )  ;
	
	var C1 = document.createElement('input');
	C1.type = 'checkbox';
	C1.className = 'textbox_feature_CheckBox' ;
	C1.checked = ( ENABLED_APPS.contains(featureName) ) ? true : false ;
	var newcell = newRow.insertCell( newRow.cells.length );
	newcell.appendChild( C1 );
	
	var CA = document.createElement('input');
	CA.type = 'text';
	CA.className = 'textbox_featurename' ;
	CA.size = 10 ;
	ASTGUI.updateFieldToValue( CA , featureName );
	var newcell = newRow.insertCell( newRow.cells.length );
	newcell.appendChild( CA );

	var CB = document.createElement('input');
	CB.type = 'text';
	CB.className = 'textbox_dialstr' ;
	CB.size = 2 ;
	ASTGUI.updateFieldToValue( CB , tmp_fields[0] );
	var newcell = newRow.insertCell( newRow.cells.length );
	newcell.appendChild( CB );

	var CC = document.createElement('select');
	CC.className = 'textbox_activeOnBy' ;
	var newcell = newRow.insertCell( newRow.cells.length );
	newcell.appendChild( CC );
	ASTGUI.selectbox.populateArray(CC,[
		{optionText:'self', optionValue:'self'}, {optionText:'peer', optionValue:'peer'} ,
		{optionText:'self/caller', optionValue:'self/caller'}, {optionText:'peer/caller', optionValue:'peer/caller'} ,
		{optionText:'self/callee', optionValue:'self/callee'}, {optionText:'peer/callee', optionValue:'peer/callee'} ,
		{optionText:'self/both', optionValue:'self/both'}, {optionText:'peer/both', optionValue:'peer/both'}
	]);
	ASTGUI.updateFieldToValue( CC , tmp_fields[1] );

	var CD = document.createElement('input');
	CD.type = 'text';
	CD.className = 'textbox_appName' ;
	CD.size = 20 ;
	ASTGUI.updateFieldToValue( CD , tmp_fields[2] );
	ASTGUI.COMBOBOX.call( CD , APPS_LIST , 195 );

	var newcell = newRow.insertCell( newRow.cells.length );
	newcell.appendChild( CD );

	var CE = document.createElement('input');
	CE.type = 'text';
	CE.className = 'textbox_appArgs' ;
	CE.size = 10 ;
	ASTGUI.updateFieldToValue( CE , tmp_fields[3] );
	var newcell = newRow.insertCell( newRow.cells.length );
	newcell.appendChild( CE );

	var DB = document.createElement('span'); DB.innerHTML = 'Delete' ; DB.className = 'guiButton';
	var newcell = newRow.insertCell( newRow.cells.length );
	ASTGUI.events.add( DB , 'click' , function(){
		newRow.parentNode.removeChild(newRow);
	});
	newcell.appendChild( DB );

};


var generate_applicationMap_TRs = function(){
	var TBL = _$('Table_applicationMap_definitions');

	var apps = 0;
	for(var featureName in ApplicationMap){
		if( !ApplicationMap.hasOwnProperty(featureName) ){ continue}
		create_new_AppMap_tr( featureName);
	}

	if( !TBL.rows.length ){
		ASTGUI.domActions.removeAllChilds(TBL);
		newRow = TBL.insertRow(-1);
		newRow.className = 'noapps';
		var newcell = newRow.insertCell( newRow.cells.length );
		newcell.innerHTML = "No Applicaiton Maps defined !";
	}
};


var load_preferences = function(){

	(function(){
		var c = context2json({ filename:'extensions.conf' , context: 'globals', usf: 1 });
		var DIAL_OPS = ( c.hasOwnProperty('DIALOPTIONS') ) ? c['DIALOPTIONS'] : '' ;
		if( c.hasOwnProperty('FEATURES') && c['FEATURES'].length )
		ENABLED_APPS = c['FEATURES'].split('#');

		_$('dialoptions_t').checked = (DIAL_OPS.contains('t')) ? true : false ;
		_$('dialoptions_T').checked = (DIAL_OPS.contains('T')) ? true : false ;
		_$('dialoptions_h').checked = (DIAL_OPS.contains('h')) ? true : false ;
		_$('dialoptions_H').checked = (DIAL_OPS.contains('H')) ? true : false ;
		_$('dialoptions_k').checked = (DIAL_OPS.contains('k')) ? true : false ;
		_$('dialoptions_K').checked = (DIAL_OPS.contains('K')) ? true : false ;
		
	})();

	var c = config2json({filename:'features.conf', usf:1});
	if( !c.hasOwnProperty(ct) || !c.hasOwnProperty(FM) || !c.hasOwnProperty('applicationmap') ){
		var u = new listOfSynActions('features.conf');
		if( !c.hasOwnProperty(ct) ) {
			u.new_action('newcat', ct, '', '');
		}
		if( !c.hasOwnProperty(FM) ) {
			u.new_action('newcat', FM, '', '');
		}
		if( !c.hasOwnProperty('applicationmap') ) {
			u.new_action('newcat', 'applicationmap', '', '');
		}
		u.callActions();
		window.location.reload();
		return;
	}

	ApplicationMap = c['applicationmap'] ;

	ASTGUI.updateFieldToValue( 'featureMap_blindxfer' , c[FM].getProperty('blindxfer') );
	ASTGUI.updateFieldToValue( 'featureMap_disconnect' , c[FM].getProperty('disconnect') );
	ASTGUI.updateFieldToValue( 'featureMap_atxfer' , c[FM].getProperty('atxfer') );
	ASTGUI.updateFieldToValue( 'featureMap_parkcall' , c[FM].getProperty('parkcall') );

	ASTGUI.updateFieldToValue( 'parkext' , c[ct].getProperty('parkext') );
	ASTGUI.updateFieldToValue( 'parkpos' , c[ct].getProperty('parkpos') );
	ASTGUI.updateFieldToValue( 'parkingtime' , c[ct].getProperty('parkingtime') );

	ASTGUI.domActions.enableDisableByCheckBox ('chk_featureMap_blindxfer',  'featureMap_blindxfer');
	ASTGUI.domActions.enableDisableByCheckBox ('chk_featureMap_disconnect', 'featureMap_disconnect');
	ASTGUI.domActions.enableDisableByCheckBox ('chk_featureMap_atxfer', 'featureMap_atxfer');
	ASTGUI.domActions.enableDisableByCheckBox ('chk_featureMap_parkcall', 'featureMap_parkcall');


	_$('chk_featureMap_blindxfer').checked = ( ASTGUI.getFieldValue('featureMap_blindxfer') ) ? true : false ;
	_$('chk_featureMap_blindxfer').updateStatus();
	_$('chk_featureMap_disconnect').checked = ( ASTGUI.getFieldValue('featureMap_disconnect') ) ? true : false ;
	_$('chk_featureMap_disconnect').updateStatus();
	_$('chk_featureMap_atxfer').checked = ( ASTGUI.getFieldValue('featureMap_atxfer') ) ? true : false ;
	_$('chk_featureMap_atxfer').updateStatus();

	_$('chk_featureMap_parkcall').checked = ( ASTGUI.getFieldValue('featureMap_parkcall') ) ? true : false ;
	_$('chk_featureMap_parkcall').updateStatus();

	generate_applicationMap_TRs();

};

var localajaxinit = function(){
	top.document.title = 'Call Parking preferences' ;

	ASTGUI.tabbedOptions( _$('tabbedMenu') , [
		{	url: '#',
			desc: 'Feature Codes',
			click_function: function(){ $('.Features_tabs').hide(); $('#featurecode_settings_container').show(); }
		},{
			url: '#',
			desc: 'Call Parking',
			click_function: function(){ $('.Features_tabs').hide(); $('#callparking_settings_container').show(); }
		},{
			url: '#',
			desc: 'Application Map',
			click_function: function(){ $('.Features_tabs').hide(); $('#applicationMap_settings_container').show(); }
		},{
			url: '#',
			desc: 'Dial Options',
			click_function: function(){ $('.Features_tabs').hide(); $('#DialOptions_settings_container').show(); }
		}
		
	]);

	try{
		load_preferences();
	}catch(err){

	}finally{
		$('#tabbedMenu').find('A:eq(0)').click();
	}
};

var save_changes = function(){

	var TBL = _$('Table_applicationMap_definitions');
	var FeatureNames = [];

	var u = new listOfSynActions('features.conf');
		u.new_action('update', ct , 'parkext', ASTGUI.getFieldValue('parkext') );
		u.new_action('update', ct , 'parkpos', ASTGUI.getFieldValue('parkpos') );
		u.new_action('update', ct , 'parkingtime', ASTGUI.getFieldValue('parkingtime') );

		var blindxfer_map = ASTGUI.getFieldValue('featureMap_blindxfer') ;
		if( _$('chk_featureMap_blindxfer').checked && blindxfer_map ){
			u.new_action('update', FM , 'blindxfer', blindxfer_map );
		}else{
			u.new_action('delete', FM , 'blindxfer', '');
		}

		var disconnect_map = ASTGUI.getFieldValue('featureMap_disconnect') ;
		if( _$('chk_featureMap_disconnect').checked && disconnect_map ){
			u.new_action('update', FM , 'disconnect', disconnect_map );
		}else{
			u.new_action('delete', FM , 'disconnect', '');
		}

		var atxfer_map = ASTGUI.getFieldValue('featureMap_atxfer') ;
		if( _$('chk_featureMap_atxfer').checked && atxfer_map ){
			u.new_action('update', FM , 'atxfer', atxfer_map );
		}else{
			u.new_action('delete', FM , 'atxfer', '');
		}

		var parkcall_map = ASTGUI.getFieldValue('featureMap_parkcall') ;
		if( _$('chk_featureMap_parkcall').checked && parkcall_map ){
			u.new_action('update', FM , 'parkcall', parkcall_map );
		}else{
			u.new_action('delete', FM , 'parkcall', '');
		}

		u.new_action( 'delcat', 'applicationmap' , '', '');
		u.new_action( 'newcat', 'applicationmap' , '', '');

		for( var R = 0, RL = TBL.rows.length ; R < RL ; R++ ){

			if( TBL.rows[R].className == 'noapps' || TBL.rows[R].className == 'frow' ){ continue; }
			var thisrow_id = '#' + String(TBL.rows[R].id) ;

			var this_featureName = $( thisrow_id + ' .textbox_featurename')[0].value.trim() ;
			if( !this_featureName )continue ;

			var this_enabled = $(thisrow_id + ' .textbox_feature_CheckBox')[0].checked ;
			if( this_enabled ) {
				FeatureNames.push(this_featureName);
			}
			var this_digits = $(thisrow_id + ' .textbox_dialstr')[0].value.trim() ;
			var this_activeOnBy = $(thisrow_id + ' .textbox_activeOnBy')[0].value.trim() ;
			var this_appName = $(thisrow_id + ' .textbox_appName')[0].value.trim() ;
			var this_args = $(thisrow_id + ' .textbox_appArgs')[0].value.trim() ;
			var tmp_arr = [this_digits, this_activeOnBy, this_appName, this_args ];

			u.new_action( 'append', 'applicationmap' , this_featureName , tmp_arr.join(',') );
		}

	u.callActions();

	var DIAL_OPS = '' ;

	if( _$('dialoptions_t').checked ) DIAL_OPS = DIAL_OPS + 't' ;
	if( _$('dialoptions_T').checked ) DIAL_OPS = DIAL_OPS + 'T' ;
	if( _$('dialoptions_h').checked ) DIAL_OPS = DIAL_OPS + 'h' ;
	if( _$('dialoptions_H').checked ) DIAL_OPS = DIAL_OPS + 'H' ;
	if( _$('dialoptions_k').checked ) DIAL_OPS = DIAL_OPS + 'k' ;
	if( _$('dialoptions_K').checked ) DIAL_OPS = DIAL_OPS + 'K' ;
	
	ASTGUI.updateaValue({ file:'extensions.conf', context :'globals', variable :'DIALOPTIONS', value : DIAL_OPS });
	ASTGUI.updateaValue({ file:'extensions.conf', context :'globals', variable :'FEATURES', value : FeatureNames.join('#') });

	ASTGUI.feedback({msg:' Saved !!', showfor: 3 , color: '#5D7CBA', bgcolor: '#FFFFFF'}) ;

	window.location.reload();
};
